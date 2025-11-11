/**
 * SaveRequestDialog Component
 *
 * Modal dialog to save current request to a collection
 */

import React, { useState, useEffect } from 'react';
import { useCollectionStore } from '../../store/collectionStore';
import { useRequestStore } from '../../store/requestStore';
import { Request } from '../../../models/Request';

interface SaveRequestDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SaveRequestDialog({ open, onClose }: SaveRequestDialogProps): React.ReactElement | null {
  const [requestName, setRequestName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const collections = useCollectionStore((state) => state.actions.getCollections());
  const savedRequests = useCollectionStore((state) => state.savedRequests);
  const createCollection = useCollectionStore((state) => state.actions.createCollection);
  const saveRequest = useCollectionStore((state) => state.actions.saveRequest);

  // Get current request state
  const url = useRequestStore((state) => state.url);
  const method = useRequestStore((state) => state.method);
  const headers = useRequestStore((state) => state.headers);
  const body = useRequestStore((state) => state.body);
  const bodyType = useRequestStore((state) => state.bodyType);
  const timeout = useRequestStore((state) => state.timeout);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setRequestName('');
      setSelectedCollectionId('');
      setNewCollectionName('');
      setError('');
      setSuccessMessage('');
    }
  }, [open]);

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  // Validation helper functions
  const validateRequestName = (name: string): string | null => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return 'Request name is required';
    }
    if (name.length > 200) {
      return 'Request name must be 200 characters or less';
    }
    return null;
  };

  const validateAndGetCollectionId = (): { collectionId: string; error: string | null } => {
    // If creating new collection
    if (selectedCollectionId === 'new') {
      const trimmedCollectionName = newCollectionName.trim();
      if (trimmedCollectionName.length === 0) {
        return { collectionId: '', error: 'Collection name is required' };
      }

      try {
        const collectionId = createCollection(trimmedCollectionName);
        return { collectionId, error: null };
      } catch (err) {
        return {
          collectionId: '',
          error: err instanceof Error ? err.message : 'Failed to create collection',
        };
      }
    }

    if (!selectedCollectionId) {
      return { collectionId: '', error: 'Please select a collection or create a new one' };
    }

    return { collectionId: selectedCollectionId, error: null };
  };

  const checkDuplicateName = (name: string, collectionId: string): boolean => {
    const existingRequests = Object.values(savedRequests).filter(
      (req) => req.collectionId === collectionId
    );
    return existingRequests.some(
      (req) => req.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleSave = (): void => {
    setError('');
    setSuccessMessage('');

    // Validate request name
    const trimmedName = requestName.trim();
    const nameError = validateRequestName(requestName);
    if (nameError) {
      setError(nameError);
      return;
    }

    // Validate and get collection ID
    const { collectionId, error: collectionError } = validateAndGetCollectionId();
    if (collectionError) {
      setError(collectionError);
      return;
    }

    // Check for duplicate names
    if (checkDuplicateName(trimmedName, collectionId)) {
      setError('A request with this name already exists in this collection');
      return;
    }

    // Build and save request
    try {
      const request = new Request({
        url,
        method,
        headers,
        body,
        bodyType,
        timeout,
      });

      saveRequest(trimmedName, collectionId, request, url);

      // Get collection name for success message
      const collection = collections.find((c) => c.id === collectionId);
      const collectionName = collection?.name || newCollectionName.trim();

      setSuccessMessage(`Request saved successfully to "${collectionName}"`);

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save request');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '500px',
          maxWidth: '600px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h2 id="dialog-title" style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>
          Save Request
        </h2>

        {/* Request Name Input */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="request-name"
            style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}
          >
            Request Name
          </label>
          <input
            id="request-name"
            type="text"
            value={requestName}
            onChange={(e) => setRequestName(e.target.value)}
            placeholder="e.g., Get Users, Create Post"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Collection Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="collection-select"
            style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}
          >
            Collection
          </label>
          <select
            id="collection-select"
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            aria-label="Collection"
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
            }}
          >
            <option value="">
              {collections.length === 0 ? 'No collections yet - create one below' : 'Select a collection'}
            </option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
            <option value="new">Create New Collection</option>
          </select>
        </div>

        {/* New Collection Name Input (shown when creating new) */}
        {selectedCollectionId === 'new' && (
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="new-collection-name"
              style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}
            >
              New Collection Name
            </label>
            <input
              id="new-collection-name"
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="e.g., User API, Products"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '16px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              padding: '8px 12px',
              marginBottom: '16px',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            aria-label="Cancel"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            aria-label="Save"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
