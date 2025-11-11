/**
 * CollectionSidebar Component
 *
 * Tree view of collections and saved requests in sidebar
 */

import React, { useState, useEffect } from 'react';
import { useCollectionStore } from '../../store/collectionStore';
import { useRequestStore } from '../../store/requestStore';

interface ContextMenuState {
  type: 'collection' | 'request';
  id: string;
  x: number;
  y: number;
}

export function CollectionSidebar(): React.ReactElement {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'collection' | 'request'; id: string } | null>(null);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const collections = useCollectionStore((state) => state.actions.getCollections());
  const getRequestsInCollection = useCollectionStore((state) => state.actions.getRequestsInCollection);
  const savedRequests = useCollectionStore((state) => state.savedRequests);
  const deleteCollection = useCollectionStore((state) => state.actions.deleteCollection);
  const deleteRequest = useCollectionStore((state) => state.actions.deleteRequest);
  const renameCollection = useCollectionStore((state) => state.actions.renameCollection);
  const updateRequest = useCollectionStore((state) => state.actions.updateRequest);
  const createCollection = useCollectionStore((state) => state.actions.createCollection);
  const saveRequest = useCollectionStore((state) => state.actions.saveRequest);
  const loadRequest = useCollectionStore((state) => state.actions.loadRequest);

  const requestActions = useRequestStore((state) => state.actions);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const handleRequestClick = (requestId: string) => {
    const request = loadRequest(requestId);
    if (!request) {
return;
}

    // Load request into request builder using actions
    requestActions.setUrl(request.url);
    requestActions.setMethod(request.method);
    requestActions.setBody(request.body);
    requestActions.setBodyType(request.bodyType);
    requestActions.setTimeout(request.timeout);

    // Update headers - clear existing and add new ones
    const currentHeaders = useRequestStore.getState().headers;
    // Remove all existing headers
    for (let i = currentHeaders.length - 1; i >= 0; i--) {
      requestActions.removeHeader(i);
    }
    // Add new headers
    request.headers.forEach(() => {
      requestActions.addHeader();
    });
    // Update header values
    request.headers.forEach((header, index) => {
      requestActions.updateHeader(index, 'name', header.name);
      requestActions.updateHeader(index, 'value', header.value);
      requestActions.updateHeader(index, 'enabled', header.enabled);
    });

    // Mark as active
    setActiveRequestId(requestId);
  };

  const handleContextMenu = (e: React.MouseEvent, type: 'collection' | 'request', id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      type,
      id,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
    setContextMenu(null);
  };

  const handleRenameSubmit = (type: 'collection' | 'request', id: string) => {
    if (!renameValue.trim()) {
return;
}

    if (type === 'collection') {
      renameCollection(id, renameValue.trim());
    } else {
      updateRequest(id, { name: renameValue.trim() });
    }

    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = (type: 'collection' | 'request', id: string) => {
    setDeleteConfirmation({ type, id });
    setContextMenu(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmation) {
return;
}

    if (deleteConfirmation.type === 'collection') {
      deleteCollection(deleteConfirmation.id);
    } else {
      deleteRequest(deleteConfirmation.id);
    }

    setDeleteConfirmation(null);
  };

  const handleDuplicate = (requestId: string) => {
    const request = loadRequest(requestId);
    if (!request) {
return;
}

    // Create duplicate with "(copy)" suffix
    saveRequest(
      `${request.name} (copy)`,
      request.collectionId,
      request.toRequest(),
      request.url
    );

    setContextMenu(null);
  };

  const handleCreateCollection = () => {
    setCreatingCollection(true);
    setNewCollectionName('');
  };

  const handleCreateCollectionSubmit = () => {
    if (!newCollectionName.trim()) {
return;
}

    createCollection(newCollectionName.trim());
    setCreatingCollection(false);
    setNewCollectionName('');
  };

  const handleCreateCollectionCancel = () => {
    setCreatingCollection(false);
    setNewCollectionName('');
  };

  // Render empty state
  if (collections.length === 0 && !creatingCollection) {
    return (
      <aside
        role="complementary"
        aria-label="Collections"
        style={{
          width: '280px',
          height: '100vh',
          borderRight: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          No collections yet. Create one to organize your requests.
        </p>
        <button
          onClick={handleCreateCollection}
          aria-label="Create Collection"
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
          Create Collection
        </button>
      </aside>
    );
  }

  return (
    <>
      <aside
        role="complementary"
        aria-label="Collections"
        style={{
          width: '280px',
          height: '100vh',
          borderRight: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          padding: '16px',
          overflow: 'auto',
        }}
      >
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', color: '#666' }}>
            Collections
          </h2>
          <button
            onClick={handleCreateCollection}
            aria-label="Create Collection"
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#007bff',
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>

        {/* New collection input */}
        {creatingCollection && (
          <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
handleCreateCollectionSubmit();
}
                if (e.key === 'Escape') {
handleCreateCollectionCancel();
}
              }}
              placeholder="Collection name"
              autoFocus
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '3px',
              }}
            />
          </div>
        )}

        {/* Collections list */}
        {collections.map((collection) => {
          const requests = getRequestsInCollection(collection.id);
          const isExpanded = expandedCollections.has(collection.id);
          const isRenaming = renamingId === collection.id;

          return (
            <div key={collection.id} style={{ marginBottom: '8px' }}>
              {/* Collection header */}
              <div
                onClick={() => !isRenaming && toggleCollection(collection.id)}
                onContextMenu={(e) => handleContextMenu(e, 'collection', collection.id)}
                style={{
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {isRenaming ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
handleRenameSubmit('collection', collection.id);
}
                      if (e.key === 'Escape') {
handleRenameCancel();
}
                    }}
                    onBlur={() => handleRenameSubmit('collection', collection.id)}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '2px 4px',
                      fontSize: '13px',
                      border: '1px solid #007bff',
                      borderRadius: '3px',
                    }}
                  />
                ) : (
                  <>
                    <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>
                      {isExpanded ? '▼' : '▶'} {collection.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#666' }}>{requests.length}</span>
                  </>
                )}
              </div>

              {/* Requests list (when expanded) */}
              {isExpanded && (
                <div style={{ marginLeft: '16px', marginTop: '4px' }}>
                  {requests.map((request) => {
                    const isRenamingRequest = renamingId === request.id;
                    const isActive = activeRequestId === request.id;

                    return (
                      <div
                        key={request.id}
                        onClick={() => !isRenamingRequest && handleRequestClick(request.id)}
                        onContextMenu={(e) => handleContextMenu(e, 'request', request.id)}
                        data-active={isActive ? 'true' : 'false'}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: isActive ? '#e7f3ff' : 'white',
                          borderLeft: isActive ? '3px solid #007bff' : '3px solid transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginBottom: '2px',
                        }}
                      >
                        {isRenamingRequest ? (
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
handleRenameSubmit('request', request.id);
}
                              if (e.key === 'Escape') {
handleRenameCancel();
}
                            }}
                            onBlur={() => handleRenameSubmit('request', request.id)}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '2px 4px',
                              fontSize: '12px',
                              border: '1px solid #007bff',
                              borderRadius: '3px',
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '12px' }}>
                            <span style={{ fontWeight: 600, color: '#666', marginRight: '6px' }}>
                              {request.method}
                            </span>
                            {request.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div
          role="menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          <button
            role="menuitem"
            onClick={() => {
              const item = contextMenu.type === 'collection'
                ? collections.find((c) => c.id === contextMenu.id)
                : savedRequests[contextMenu.id];
              if (item) {
                handleRenameStart(contextMenu.id, item.name);
              }
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              fontSize: '13px',
              border: 'none',
              backgroundColor: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            Rename
          </button>
          {contextMenu.type === 'request' && (
            <button
              role="menuitem"
              onClick={() => handleDuplicate(contextMenu.id)}
              style={{
                width: '100%',
                padding: '8px 16px',
                fontSize: '13px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              Duplicate
            </button>
          )}
          <button
            role="menuitem"
            onClick={() => handleDelete(contextMenu.type, contextMenu.id)}
            style={{
              width: '100%',
              padding: '8px 16px',
              fontSize: '13px',
              border: 'none',
              backgroundColor: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              color: '#dc3545',
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
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
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <p style={{ margin: '0 0 16px', fontSize: '14px' }}>
              Are you sure you want to delete this {deleteConfirmation.type}?
              {deleteConfirmation.type === 'collection' && ' All requests in this collection will also be deleted.'}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmation(null)}
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
                onClick={handleDeleteConfirm}
                aria-label="Confirm"
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
