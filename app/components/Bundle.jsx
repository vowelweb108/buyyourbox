import { TextField, Button, DropZone, Thumbnail, Text, Card, FormLayout } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { NoteIcon } from '@shopify/polaris-icons';
import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { BlockStack } from '@shopify/polaris';

const animatedComponents = makeAnimated();

function Bundle() {
  const [title, setTitle] = useState('');
  const [productTitles, setProductTitles] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [image, setImage] = useState('');
  const [selectedBunches, setSelectedBunches] = useState([]);
  const [titleError, setTitleError] = useState('');
  const [imageError, setImageError] = useState('');
  const [bunchesError, setBunchesError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [productIds, setProductIds] = useState([]); // State to store product IDs
  const [editingIndex, setEditingIndex] = useState(null); // Index of the product being edited

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
      const productTitles = selected.selection.map(product => product.title);
      const productImages = selected.selection.map(product => product.images[0]?.originalSrc || '');
      
      setProductTitles(productTitles);
      setProductImages(productImages);
      
      const ids = selected.selection.map(product => product.id);
      setProductIds(ids);
      
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
    <div style={{ padding: '0' }}>
      {files.map((file, index) => (
        <div key={index}>
          <Thumbnail
            size="small"
            alt={file.name}
            source={
              validImageTypes.includes(file.type)
                ? window.URL.createObjectURL(file)
                : NoteIcon
            }
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

      updatedTitles[editingIndex] = title;
      updatedImages[editingIndex] = image;

      setProductTitles(updatedTitles);
      setProductImages(updatedImages);

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

      updatedTitles[index] = selectedProduct[0].title;
      updatedImages[index] = selectedProduct[0].images[0]?.originalSrc || '';

      setProductTitles(updatedTitles);
      setProductImages(updatedImages);

      setTitle(selectedProduct[0].title);
      setImage(selectedProduct[0].images[0]?.originalSrc || '');
    }
  };

  const handleDelete = (index) => {
    const updatedTitles = [...productTitles];
    const updatedImages = [...productImages];
    updatedTitles.splice(index, 1);
    updatedImages.splice(index, 1);
    setProductTitles(updatedTitles);
    setProductImages(updatedImages);
  };

  return (
    <FormLayout>
      {generalError && <Card sectioned title="Error"><Text color="red">{generalError}</Text></Card>}

      <Button onClick={() => resourcePicker(false)}>Pick Resource</Button>

      {productTitles.length > 0 && (
        <Card sectioned title="Selected Products">
          <ul>
            {productTitles.map((title, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Thumbnail
                  size="small"
                  alt={title}
                  source={productImages[index]}
                />
                <span style={{ marginLeft: '10px' }}>{title}</span>
                <Button onClick={() => handleEdit(index)} plain>Edit</Button>
                <Button onClick={() => handleDelete(index)} plain destructive style={{ marginLeft: '10px' }}>Delete</Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <BlockStack gap="400" sectioned>
        <Card sectioned>
          <TextField
            label="Title"
            value={title}
            onChange={handleTitleChange}
            autoComplete="off"
            placeholder="Enter the bundle title"
            error={titleError}
          />
        </Card>
        
        <div>
          <label htmlFor="bunches-select">Bunches</label>
          <Select
            id="bunches-select"
            closeMenuOnSelect={false}
            components={animatedComponents}
            value={selectedBunches}
            onChange={handleBunchesChange}
            isMulti
            options={colourOptions}
            placeholder="Select bunches"
          />
          {bunchesError && <Text color="red" as="p">{bunchesError}</Text>}
        </div>
    
        <Card sectioned>
          <DropZone onDrop={handleDropZoneDrop}>
            {uploadedFiles}
            {fileUpload}
          </DropZone>
          {imageError && <Text color="red">{imageError}</Text>}
        </Card>

        <Button onClick={handleSubmit}>
          {editingIndex !== null ? 'Save Changes' : 'Save Product'}
        </Button>
      </BlockStack>
    </FormLayout>
  );
}

export default Bundle;
