/**
 * SaveRequestDialog Component Tests
 *
 * Tests for save request dialog with collection selection and inline creation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveRequestDialog } from './SaveRequestDialog';
import { useCollectionStore } from '../../store/collectionStore';
import { useRequestStore } from '../../store/requestStore';
import { HttpMethod, BodyType } from '../../../types/request.types';
import { CollectionService } from '../../services/collectionService';
import { Request } from '../../../models/Request';

describe('SaveRequestDialog', () => {
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

  describe('Dialog rendering', () => {
    it('should render dialog when open prop is true', () => {
      render(<SaveRequestDialog open={true} onClose={() => {}} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open prop is false', () => {
      render(<SaveRequestDialog open={false} onClose={() => {}} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog title', () => {
      render(<SaveRequestDialog open={true} onClose={() => {}} />);
      expect(screen.getByText('Save Request')).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(<SaveRequestDialog open={true} onClose={onClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key pressed', () => {
      const onClose = vi.fn();
      render(<SaveRequestDialog open={true} onClose={onClose} />);

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request name input', () => {
    it('should render request name input field', () => {
      render(<SaveRequestDialog open={true} onClose={() => {}} />);
      expect(screen.getByLabelText(/request name/i)).toBeInTheDocument();
    });

    it('should allow typing in request name field', async () => {
      const user = userEvent.setup();
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const input = screen.getByLabelText(/request name/i) as HTMLInputElement;
      await user.type(input, 'My API Request');

      expect(input.value).toBe('My API Request');
    });

    it('should show error when request name is empty', async () => {
      const user = userEvent.setup();
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      expect(screen.getByText(/request name is required/i)).toBeInTheDocument();
    });

    it('should show error when request name is too long', async () => {
      const user = userEvent.setup();
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const input = screen.getByLabelText(/request name/i);
      const longName = 'a'.repeat(201);
      await user.type(input, longName);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      expect(screen.getByText(/request name must be 200 characters or less/i)).toBeInTheDocument();
    });

    it('should trim whitespace from request name', async () => {
      const user = userEvent.setup();
      const requestStore = useRequestStore.getState();

      requestStore.actions.setUrl('https://api.example.com/test');
      const collectionId = useCollectionStore.getState().actions.createCollection('My Collection');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, '  Test Request  ');

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, collectionId);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      // Wait for save to complete
      await waitFor(() => {
        const collectionStore = useCollectionStore.getState();
        const savedRequests = Object.values(collectionStore.savedRequests);
        expect(savedRequests.length).toBeGreaterThan(0);
        expect(savedRequests[0]?.name).toBe('Test Request');
      });
    });
  });

  describe('Collection selection', () => {
    it('should render collection dropdown', () => {
      render(<SaveRequestDialog open={true} onClose={() => {}} />);
      expect(screen.getByRole('combobox', { name: /collection/i })).toBeInTheDocument();
    });

    it('should list existing collections in dropdown', () => {
      const collectionStore = useCollectionStore.getState();
      collectionStore.actions.createCollection('Collection A');
      collectionStore.actions.createCollection('Collection B');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i });
      expect(select).toHaveTextContent('Collection A');
      expect(select).toHaveTextContent('Collection B');
    });

    it('should allow selecting a collection', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      collectionStore.actions.createCollection('Collection A');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i }) as HTMLSelectElement;
      const collections = collectionStore.actions.getCollections();

      await user.selectOptions(select, collections[0]!.id);

      expect(select.value).toBe(collections[0]!.id);
    });

    it('should show error when no collection is selected', async () => {
      const user = userEvent.setup();
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Test Request');

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      expect(screen.getByText(/please select a collection/i)).toBeInTheDocument();
    });
  });

  describe('Create new collection inline', () => {
    it('should show "Create New Collection" option in dropdown', () => {
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i });
      expect(select).toHaveTextContent('Create New Collection');
    });

    it('should show collection name input when "Create New Collection" is selected', async () => {
      const user = userEvent.setup();
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, 'new');

      expect(screen.getByLabelText(/new collection name/i)).toBeInTheDocument();
    });

    it('should hide collection name input when existing collection is selected', async () => {
      const user = userEvent.setup();
      const collectionStore = useCollectionStore.getState();
      collectionStore.actions.createCollection('Existing Collection');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, 'new');

      expect(screen.getByLabelText(/new collection name/i)).toBeInTheDocument();

      const collections = collectionStore.actions.getCollections();
      await user.selectOptions(select, collections[0]!.id);

      expect(screen.queryByLabelText(/new collection name/i)).not.toBeInTheDocument();
    });

    it('should validate new collection name is not empty', async () => {
      const user = userEvent.setup();
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, 'new');

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Test Request');

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      expect(screen.getByText(/collection name is required/i)).toBeInTheDocument();
    });

    it('should create new collection and save request when valid', async () => {
      const user = userEvent.setup();
      const requestStore = useRequestStore.getState();
      requestStore.actions.setUrl('https://api.example.com/users');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, 'new');

      const collectionInput = screen.getByLabelText(/new collection name/i);
      await user.type(collectionInput, 'New Collection');

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Test Request');

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      await waitFor(() => {
        const collectionStore = useCollectionStore.getState();
        const collections = collectionStore.actions.getCollections();
        expect(collections).toHaveLength(1);
        expect(collections[0]!.name).toBe('New Collection');

        const requests = Object.values(collectionStore.savedRequests);
        expect(requests).toHaveLength(1);
        expect(requests[0]?.name).toBe('Test Request');
      });
    });
  });

  describe('Save functionality', () => {
    it('should save request with all fields when Save clicked', async () => {
      const user = userEvent.setup();
      const requestStore = useRequestStore.getState();

      // Set up request state
      requestStore.actions.setUrl('https://api.example.com/{{endpoint}}');
      requestStore.actions.setMethod(HttpMethod.POST);
      requestStore.actions.addHeader();
      requestStore.actions.updateHeader(0, 'name', 'Content-Type');
      requestStore.actions.updateHeader(0, 'value', 'application/json');
      requestStore.actions.setBody('{"key": "value"}');
      requestStore.actions.setBodyType(BodyType.JSON);

      const collectionId = useCollectionStore.getState().actions.createCollection('My Collection');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Create User');

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, collectionId);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      await waitFor(() => {
        const collectionStore = useCollectionStore.getState();
        const requests = Object.values(collectionStore.savedRequests);
        expect(requests).toHaveLength(1);

        const saved = requests[0];
        expect(saved?.name).toBe('Create User');
        expect(saved?.url).toBe('https://api.example.com/{{endpoint}}');
        expect(saved?.method).toBe(HttpMethod.POST);
        expect(saved?.headers).toHaveLength(1);
        expect(saved?.headers[0]!.name).toBe('Content-Type');
        expect(saved?.body).toBe('{"key": "value"}');
        expect(saved?.bodyType).toBe(BodyType.JSON);
      });
    });

    it('should preserve {{variables}} in URL when saving', async () => {
      const user = userEvent.setup();
      const requestStore = useRequestStore.getState();

      requestStore.actions.setUrl('{{baseUrl}}/api/{{version}}/users');

      const collectionId = useCollectionStore.getState().actions.createCollection('My Collection');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Get Users');

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, collectionId);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      await waitFor(() => {
        const collectionStore = useCollectionStore.getState();
        const requests = Object.values(collectionStore.savedRequests);
        expect(requests[0]?.url).toBe('{{baseUrl}}/api/{{version}}/users');
      });
    });

    it('should show success message after successful save', async () => {
      const user = userEvent.setup();
      const requestStore = useRequestStore.getState();

      requestStore.actions.setUrl('https://api.example.com/test');
      const collectionId = useCollectionStore.getState().actions.createCollection('My Collection');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Test Request');

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, collectionId);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/request saved successfully to "my collection"/i)).toBeInTheDocument();
      });
    });

    it('should close dialog automatically after successful save', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const requestStore = useRequestStore.getState();

      requestStore.actions.setUrl('https://api.example.com/test');
      const collectionId = useCollectionStore.getState().actions.createCollection('My Collection');

      render(<SaveRequestDialog open={true} onClose={onClose} />);

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Test Request');

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, collectionId);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should show error for duplicate request names in same collection', async () => {
      const user = userEvent.setup();
      const requestStore = useRequestStore.getState();

      requestStore.actions.setUrl('https://api.example.com/test');
      const collectionId = useCollectionStore.getState().actions.createCollection('My Collection');

      // Save first request
      const request = new Request({
        url: 'https://api.example.com/test',
        method: HttpMethod.GET,
        headers: [],
        body: '',
        bodyType: BodyType.NONE,
        timeout: 30000,
      });
      useCollectionStore.getState().actions.saveRequest('Existing Request', collectionId, request, 'https://api.example.com/test');

      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const nameInput = screen.getByLabelText(/request name/i);
      await user.type(nameInput, 'Existing Request');

      const select = screen.getByRole('combobox', { name: /collection/i });
      await user.selectOptions(select, collectionId);

      const saveButton = screen.getByRole('button', { name: /^save$/i });
      await user.click(saveButton);

      expect(screen.getByText(/request with this name already exists/i)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show message when no collections exist', () => {
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      expect(screen.getByText(/no collections yet/i)).toBeInTheDocument();
    });

    it('should show create collection option when no collections exist', () => {
      render(<SaveRequestDialog open={true} onClose={() => {}} />);

      const select = screen.getByRole('combobox', { name: /collection/i });
      expect(select).toHaveTextContent('Create New Collection');
    });
  });
});
