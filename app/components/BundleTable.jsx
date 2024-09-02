import React, { useEffect, useState } from 'react';
import { IndexTable, Card, Page, Button, Thumbnail, Text, Modal, FormLayout, TextField } from '@shopify/polaris';
import { useNavigate, useParams } from '@remix-run/react';
import Bundle from './Bundle';

function BundleTable({productId}) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBundle, setShowCreateBundle] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [title, setTitle] = useState('');
  const [bunches, setBunches] = useState('');
  const [image, setImage] = useState('');
  const navigate = useNavigate()
  const handleCreateBundle = () => setShowCreateBundle(true);

  const handleEditBundle = (bundle) => {
    // setEditingBundle(bundle);
    // setTitle(bundle.title);
    // setBunches(bundle.bunches.join(', '));
    // setImage(bundle.image);
    // setShowEditModal(true);
    console.log("INSIDE_BUNDLE_PRODUCT", bundle)
   return navigate(`./bundle/${bundle._id}`)
};

  const handleSaveEdit = async () => {
    debugger
    try {
    //   const response = await fetch('/api/bundles/edit', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       id: editingBundle._id,
    //       title,
    //       bunches: bunches.split(',').map(b => b.trim()),
    //       image,
    //     }),
    //   });

    //   if (response.ok) {
    //     const updatedBundle = await response.json();
    //     setBundles(bundles.map(bundle => 
    //       bundle._id === updatedBundle.bundle._id ? updatedBundle.bundle : bundle
    //     ));
    //     setShowEditModal(false);
    //   } else {
    //     const error = await response.json();
    //     console.error('Failed to update bundle:', error.error);
    //   }

    navigate(`./api/bundle/${productId}`)
    } catch (error) {
      console.error('Failed to update bundle:', error);
    }
  };

  const handleDeleteBundle = async (bundleId) => {
    if (window.confirm('Are you sure you want to delete this bundle?')) {
      try {
        const response = await fetch('/api/bundles/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: bundleId }),
        });

        if (response.ok) {
          setBundles(bundles.filter((bundle) => bundle._id !== bundleId));
        } else {
          const error = await response.json();
          console.error('Failed to delete bundle:', error.error);
        }
      } catch (error) {
        console.error('Failed to delete bundle:', error);
      }
    }
  };

  
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const product_id = productId || 0
        console.log("product_id", product_id)
        const response = await fetch(`/api/bundles/${product_id}`);
        const data = await response.json();
        setBundles(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch bundles:', error);
        setLoading(false);
      }
    };

    fetchBundles();
  }, [productId]);

  const resourceName = {
    singular: 'bundle',
    plural: 'bundles',
  };

  const rowMarkup = bundles.map((bundle, index) => (
    <IndexTable.Row
      id={bundle._id}
      key={bundle._id}
      position={index}
    >
      <IndexTable.Cell>
        <Thumbnail source={bundle.image} alt={bundle.title} />
      </IndexTable.Cell>
      <IndexTable.Cell>{bundle.title}</IndexTable.Cell>
      <IndexTable.Cell>{bundle.bunches.join(', ')}</IndexTable.Cell>
      <IndexTable.Cell>{bundle.products.length}</IndexTable.Cell>
      <IndexTable.Cell>{new Date(bundle.createdAt).toLocaleString()}</IndexTable.Cell>
      <IndexTable.Cell>
        <Button onClick={() => handleEditBundle(bundle)}>Edit</Button>
        <Button destructive onClick={() => handleDeleteBundle(bundle._id)}>Delete</Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Bundles">
      <Card>
        <IndexTable
          resourceName={resourceName}
          itemCount={bundles.length}
          loading={loading}
          headings={[
            { title: 'Image' },
            { title: 'Title' },
            { title: 'Bunches' },
            { title: 'Products' },
            { title: 'Created At' },
            { title: 'Actions' },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
      <Button onClick={()=> navigate('./bundle')}>Create Bundle</Button>

      {showEditModal && (
        <Modal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Bundle"
          primaryAction={{
            content: 'Save',
            onAction: handleSaveEdit,
          }}
        >
          <Modal.Section>
            <FormLayout>
              <TextField
                label="Title"
                value={title}
                onChange={(value) => setTitle(value)}
              />
              <TextField
                label="Bunches"
                value={bunches}
                onChange={(value) => setBunches(value)}
              />
              <TextField
                label="Image URL"
                value={image}
                onChange={(value) => setImage(value)}
              />
            </FormLayout>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}

export default BundleTable;
