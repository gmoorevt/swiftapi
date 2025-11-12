/**
 * CollectionSidebar Component Tests
 *
 * Tests for collection and request tree view in sidebar
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollectionSidebar } from './CollectionSidebar';
import { useCollectionStore } from '../../store/collectionStore';
import { useRequestStore } from '../../store/requestStore';
import { CollectionService } from '../../services/collectionService';
import { HttpMethod, BodyType } from '../../../types/request.types';
import { Request } from '../../../models/Request';

describe('CollectionSidebar', () => {
  beforeEach(() => {
    // Clear collection service storage
    const collectionService = new CollectionService();
    collectionService.clear();

    // Reset stores before each test
    const collectionStore = useCollectionStore.getState();
    const requestStore = useRequestStore.getState();

    // Reset collection store state
    collectionStore.collections = {};
    collectionStore.savedRequests = {};
    collectionStore.isLoaded = false;

    // Reset request store to default state
    requestStore.actions.resetRequest();
  });

  describe('Rendering', () => {
    it('should render the sidebar', () => {
      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);
      expect(screen.getByRole('complementary', { name: /collections/i })).toBeInTheDocument();
    });

    it('should show empty state when no collections exist', () => {
      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);
      expect(screen.getByText(/no collections yet/i)).toBeInTheDocument();
    });

    it('should show "Create Collection" button in empty state', () => {
      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);
      expect(screen.getByRole('button', { name: /create collection/i })).toBeInTheDocument();
    });
  });

  describe('Collection display', () => {
    it('should display list of collections', () => {
      useCollectionStore.getState().actions.createCollection('Collection A');
      useCollectionStore.getState().actions.createCollection('Collection B');

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      // Collections should appear with arrow and name
      expect(screen.getByText(/Collection A/)).toBeInTheDocument();
      expect(screen.getByText(/Collection B/)).toBeInTheDocument();
    });

    it('should show collection count for each collection', () => {
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      // Add some requests
      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Request 1',
        collectionId,
        request,
        'https://api.example.com/users'
      );
      collectionStore.actions.saveRequest(
        'Request 2',
        collectionId,
        request,
        'https://api.example.com/posts'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      expect(screen.getByText(/2/i)).toBeInTheDocument();
    });

    it('should collapse collections by default', () => {
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Test Request',
        collectionId,
        request,
        'https://api.example.com/users'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      // Request should not be visible initially (collapsed)
      expect(screen.queryByText('Test Request')).not.toBeInTheDocument();
    });
  });

  describe('Expand/collapse functionality', () => {
    it('should expand collection when clicked', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Test Request',
        collectionId,
        request,
        'https://api.example.com/users'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      const collectionHeader = screen.getByText(/My Collection/);
      await user.click(collectionHeader);

      expect(screen.getByText('Test Request')).toBeInTheDocument();
    });

    it('should collapse collection when clicked again', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Test Request',
        collectionId,
        request,
        'https://api.example.com/users'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      const collectionHeader = screen.getByText(/My Collection/);

      // Expand
      await user.click(collectionHeader);
      expect(screen.getByText('Test Request')).toBeInTheDocument();

      // Collapse
      await user.click(collectionHeader);
      expect(screen.queryByText('Test Request')).not.toBeInTheDocument();
    });
  });

  describe('Request loading', () => {
    it('should load request into builder when clicked', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      const request = new Request({
        url: 'https://api.example.com/{{endpoint}}',
        method: HttpMethod.POST,
        headers: [{ name: 'Content-Type', value: 'application/json', enabled: true }],
        body: '{"key": "value"}',
        bodyType: BodyType.JSON,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Create User',
        collectionId,
        request,
        'https://api.example.com/{{endpoint}}'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      // Expand collection
      const collectionHeader = screen.getByText(/My Collection/);
      await user.click(collectionHeader);

      // Click request
      const requestItem = screen.getByText('Create User');
      await user.click(requestItem);

      // Verify request was loaded into store (get fresh state after click)
      await waitFor(() => {
        const state = useRequestStore.getState();
        expect(state.url).toBe('https://api.example.com/{{endpoint}}');
        expect(state.method).toBe(HttpMethod.POST);
        expect(state.headers).toHaveLength(1);
        expect(state.headers[0]!.name).toBe('Content-Type');
        expect(state.body).toBe('{"key": "value"}');
        expect(state.bodyType).toBe(BodyType.JSON);
      });
    });

    it('should highlight active/loaded request', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Get Users',
        collectionId,
        request,
        'https://api.example.com/users'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      // Expand collection
      const collectionHeader = screen.getByText(/My Collection/);
      await user.click(collectionHeader);

      // Click request
      const requestItem = screen.getByText('Get Users');
      await user.click(requestItem);

      // Check if request has active class/data-attribute
      expect(requestItem.closest('[data-active="true"]')).toBeInTheDocument();
    });
  });

  describe('Context menu', () => {
    it('should show context menu on right-click for collection', async () => {
      const collectionStore = useCollectionStore.getState();
      collectionStore.actions.createCollection('My Collection');

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      const collectionHeader = screen.getByText(/My Collection/);
      fireEvent.contextMenu(collectionHeader);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
    });

    it('should show context menu on right-click for request', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Get Users',
        collectionId,
        request,
        'https://api.example.com/users'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      // Expand collection
      const collectionHeader = screen.getByText(/My Collection/);
      await user.click(collectionHeader);

      // Right-click request
      const requestItem = screen.getByText('Get Users');
      fireEvent.contextMenu(requestItem);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /duplicate/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeInTheDocument();
    });

    it('should rename collection when rename clicked', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      collectionStore.actions.createCollection('Old Name');

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      const collectionHeader = screen.getByText(/Old Name/);
      fireEvent.contextMenu(collectionHeader);

      const renameButton = screen.getByRole('menuitem', { name: /rename/i });
      await user.click(renameButton);

      // Should show inline input
      const input = screen.getByDisplayValue('Old Name');
      await user.clear(input);
      await user.type(input, 'New Name');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/New Name/)).toBeInTheDocument();
        expect(screen.queryByText(/Old Name/)).not.toBeInTheDocument();
      });
    });

    it('should delete collection with confirmation', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      collectionStore.actions.createCollection('My Collection');

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      const collectionHeader = screen.getByText(/My Collection/);
      fireEvent.contextMenu(collectionHeader);

      const deleteButton = screen.getByRole('menuitem', { name: /delete/i });
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText(/My Collection/)).not.toBeInTheDocument();
      });
    });

    it('should duplicate request', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      const collectionId = collectionStore.actions.createCollection('My Collection');

      const request = new Request({
        url: 'https://api.example.com/users',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      collectionStore.actions.saveRequest(
        'Get Users',
        collectionId,
        request,
        'https://api.example.com/users'
      );

      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      // Expand collection
      const collectionHeader = screen.getByText(/My Collection/);
      await user.click(collectionHeader);

      // Right-click request
      const requestItem = screen.getByText('Get Users');
      fireEvent.contextMenu(requestItem);

      const duplicateButton = screen.getByRole('menuitem', { name: /duplicate/i });
      await user.click(duplicateButton);

      await waitFor(() => {
        expect(screen.getByText('Get Users (copy)')).toBeInTheDocument();
      });
    });
  });

  describe('Create collection button', () => {
    it('should create new collection when button clicked', async () => {
      const user = userEvent.setup();
      render(<CollectionSidebar isOpen={true} onClose={() => {}} />);

      const createButton = screen.getByRole('button', { name: /create collection/i });
      await user.click(createButton);

      // Should show inline input for new collection name
      const input = screen.getByPlaceholderText(/collection name/i);
      await user.type(input, 'New Collection');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/New Collection/)).toBeInTheDocument();
      });
    });
  });
});
