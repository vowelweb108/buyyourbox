import {
  TextField,
  Button,
  DropZone,
  Thumbnail,
  Text,
  FormLayout,
  Page,
  LegacyCard,
  IndexTable,
  useIndexResourceState,
} from '@shopify/polaris';

import { useState, useCallback, useEffect } from 'react';
import { NoteIcon } from '@shopify/polaris-icons';
import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './Bundle.css';
import BundleTable from './BundleTable.jsx';
import { useNavigate } from '@remix-run/react';

const animatedComponents = makeAnimated();
React.useLayoutEffect = React.useEffect
function Bundle({productId}) {
  console.log(productId, "PRODUCT_ID")
  const [title, setTitle] = useState('');
  const[handle, setHandle] = useState('');
  const [productTitles, setProductTitles] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [productStatus, setProductStatus] = useState([]); // State to store product statuses
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState('');
  const [selectedBunches, setSelectedBunches] = useState([]);
  const [titleError, setTitleError] = useState('');
  const [imageError, setImageError] = useState('');
  const [bunchesError, setBunchesError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [productIds, setProductIds] = useState([]); // State to store product IDs
  const [editingIndex, setEditingIndex] = useState(null); // Index of the product being edited
  const navigate = useNavigate()
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleBunchesChange = (selectedOptions) => {
    setSelectedBunches(selectedOptions || []);
  };

  const generateOptions = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    }));
  };

  const resourcePicker = async (singleSelection = false) => {
    try {
      const selected = await shopify.resourcePicker({
        type: 'product',
        multiple: !singleSelection, // Allow multiple selection only if singleSelection is false
      });
      console.log(selected);

      const productTitles = selected.selection.map(product => product.title);
      const productImages = selected.selection.map(product => product.images[0]?.originalSrc || '');
      const productStatuses = selected.selection.map(product => product.status); // Get the status

      setProductTitles([...productTitles]);
      setProductImages([...productImages]);
      setProductStatus([...productStatuses]); // Set the status

      const ids = selected.selection.map(product => product.id);
      setProductIds([...productIds, ...ids]);

      setCurrentPage(1); // Reset to the first page after new products are added
      return selected.selection; // Return the selected product(s)
    } catch (error) {
      console.error('Error picking resources:', error);
      setGeneralError('Failed to pick resources.');
      return null;
    }
  };

  const colourOptions = generateOptions();

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setFiles((files) => [...files, ...acceptedFiles]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 string representation of the image
      };
      reader.readAsDataURL(acceptedFiles[0]);
    },
    []
  );

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  const fileUpload = !files.length && <DropZone.FileUpload />;
  const uploadedFiles = files.length > 0 && (
    <div className='image-container' style={{ padding: '0' }}>
      {files.map((file, index) => (
        <div key={index}>
          <img
            src={
              validImageTypes.includes(file.type)
                ? window.URL.createObjectURL(file)
                : NoteIcon
            }
            height={300} width={500} alt="Logo"
          />
          <div>
            <Text>{file.name}</Text>
            <Text variant="bodySm">{file.size} bytes</Text>
          </div>
        </div>
      ))}
    </div>
  );

  const handleTitleChange = useCallback((newValue) => setTitle(newValue), []);

  const handleHandleChange = useCallback((newValue) => setHandle(newValue), []);

  const handleSubmit = async () => {
    let valid = true;

    if (!title.trim()) {
      setTitleError('Title is required.');
      valid = false;
    } else {
      setTitleError('');
    }
  
    if (!image) {
      setImageError('An image is required.');
      valid = false;
    } else {
      setImageError('');
    }
  
    if (selectedBunches.length === 0) {
      setBunchesError('At least one bunch must be selected.');
      valid = false;
    } else {
      setBunchesError('');
    }
  
    if (!valid) {
      return;
    }

    if (editingIndex !== null) {
      const updatedTitles = [...productTitles];
      const updatedImages = [...productImages];
      const updatedStatuses = [...productStatus]; // Update statuses

      updatedTitles[editingIndex] = title;
      updatedImages[editingIndex] = image;

      updatedStatuses[editingIndex] = productStatus[editingIndex]; // Ensure status remains the same

      setProductTitles(updatedTitles);
      setProductImages(updatedImages);
      setProductStatus(updatedStatuses);

      setEditingIndex(null);
    } else {
      try {
        const response = await fetch('/api/product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            image,
            bunches: selectedBunches.map(option => option.value),
            products: productIds,
            handle
          }),
        });

        if (response.ok) {
          console.log('Product saved successfully!');
          
          setTitle('');
          setFiles([]);
          setImage('');
          setSelectedBunches([]);
          setProductIds([]);
          setGeneralError('');
        } else {
          console.error('Failed to save product');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  };

  const handleEdit = async (index) => {
    console.log('Edit product:', index);
    const selectedProduct = await resourcePicker(true); // Open resource picker with single selection

    if (selectedProduct && selectedProduct.length > 0) {
      const updatedTitles = [...productTitles];
      const updatedImages = [...productImages];
      const updatedStatuses = [...productStatus]; // Update statuses

      updatedTitles[index] = selectedProduct[0].title;
      updatedImages[index] = selectedProduct[0].images[0]?.originalSrc || '';
      updatedStatuses[index] = selectedProduct[0].status; // Update status

      setProductTitles(updatedTitles);
      setProductImages(updatedImages);
      setProductStatus(updatedStatuses);
    }
  };

  const handleDelete = (index) => {
    const updatedTitles = [...productTitles];
    const updatedImages = [...productImages];
    const updatedStatuses = [...productStatus]; // Update statuses
    updatedTitles.splice(index, 1);
    updatedImages.splice(index, 1);
    updatedStatuses.splice(index, 1); // Remove status

    setProductTitles(updatedTitles);
    setProductImages(updatedImages);
    setProductStatus(updatedStatuses);
  };

  // Pagination functions
  const totalPages = Math.ceil(productTitles.length / itemsPerPage);

  const paginatedProductTitles = productTitles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedProductImages = productImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedProductStatuses = productStatus.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // IndexTable setup
  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const items = paginatedProductTitles.map((title, index) => ({
    id: index.toString(),
    title,
    image: paginatedProductImages[index],
    status: paginatedProductStatuses[index], // Include status
  }));

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(items);

  const rowMarkup = items.map(({ id, title, image, status }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
      selectable={false}
    >
      <IndexTable.Cell>
        <Thumbnail size="small" alt={title} source={image} />
      </IndexTable.Cell>
      <IndexTable.Cell>{title}</IndexTable.Cell>
      <IndexTable.Cell>{status}</IndexTable.Cell> {/* Add status column */}
      <IndexTable.Cell >
        <Button onClick={() => handleEdit(index + (currentPage - 1) * itemsPerPage)} plain>Edit</Button>
        <Button  onClick={() => handleDelete(index + (currentPage - 1) * itemsPerPage)} plain destructive style={{ marginLeft: '10px' }}>Delete</Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  useEffect(()=> {
    console.log("INSIDE_BUNDLE_COMPONENT)))))", productId)
  }, [productId])

  return (
    <Page title="Bundle">


{/* <BundleTable/> */}

      <FormLayout>
        {generalError && <LegacyCard sectioned title="Error"><Text color="red">{generalError}</Text></LegacyCard>}





        <Button onClick={() => resourcePicker(false)}>Pick Resource</Button>

        {items.length > 0 && (
          <LegacyCard sectioned title="Selected Products">
            <IndexTable
              resourceName={resourceName}
              itemCount={items.length}
              selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: 'Image' },
                { title: 'Title' },
                { title: 'Status' }, // Add status heading
                { title: 'Actions' },
              ]}
            >
              {rowMarkup}
            </IndexTable>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <Button disabled={currentPage === 1} onClick={handlePreviousPage}>Previous</Button>
              <Text>{`Page ${currentPage} of ${totalPages}`}</Text>
              <Button disabled={currentPage === totalPages} onClick={handleNextPage}>Next</Button>
            </div>
          </LegacyCard>
        )}

        <TextField
          label="Title"
          value={title}
          onChange={handleTitleChange}
          error={titleError}
        />

<TextField
          label="Handle"
          value={handle}
          onChange={handleHandleChange}
          
        />

        <DropZone 
       label="Image"
        
        onDrop={handleDropZoneDrop}>
        <div className='dropzone'>
        {uploadedFiles}
        {fileUpload}
        </div>
        </DropZone>

        <Select
  closeMenuOnSelect={false}
  components={animatedComponents}
  isMulti
  options={colourOptions}
  value={selectedBunches}
  onChange={handleBunchesChange}
  placeholder="Select Bunches"
  // Adding the error message here
  styles={{
    control: (base) => ({
      ...base,
      borderColor: bunchesError ? 'red' : base.borderColor, // Add red border if there's an error
      boxShadow: 'none',
      '&:hover': {
        borderColor: bunchesError ? 'red' : base.borderColor,
      },
    }),
  }}
/>
{bunchesError && <Text color="red">{bunchesError}</Text>}


        <Button fullWidth onClick={handleSubmit}>
          Save Product
        </Button>
      </FormLayout>
    </Page>
  );
}

export default Bundle;
