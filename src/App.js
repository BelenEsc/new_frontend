import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle, Users, FileText, Package, TestTube, Dna } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserMenu from './components/auth/UserMenu';
import './styles.css';
import './auth.css'; // Importar estilos de autenticación

const AppContent = () => {
  const { apiRequest, user } = useAuth(); // Usar el contexto de autenticación
  
  // Main state
  const [activeTab, setActiveTab] = useState('requests');
  const [data, setData] = useState({
    requesters: [],
    requests: [],
    metadata: [],
    shipments: [],
    tissues: [],
    dnaAliquots: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Tab and form configuration (mantener igual)
  const tabConfig = {
    requesters: {
      title: 'Requesters',
      icon: Users,
      endpoint: '/requesters/',
      fields: {
        first_name: { label: 'First Name', type: 'text', required: true },
        last_name: { label: 'Last Name', type: 'text', required: true },
        contact_person_email: { label: 'Email', type: 'email', required: true },
        requester_institution: { label: 'Institution', type: 'text', required: true },
        institution_location: { label: 'Location', type: 'text', required: true }
      },
      displayField: item => `${item.first_name} ${item.last_name}`,
      secondaryField: item => item.requester_institution
    },
    requests: {
      title: 'Requests',
      icon: FileText,
      endpoint: '/requests/',
      fields: {
        requester: { label: 'Requester', type: 'select', required: true, options: 'requesters' },
        request_date: { label: 'Request Date', type: 'date', required: true },
        tissue_sample_quantity: { label: 'Tissue Quantity', type: 'number' },
        aliquot_sample_quantity: { label: 'Aliquot Quantity', type: 'number' },
        has_manifest_file: { label: 'Has Manifest File?', type: 'checkbox' },
        manifest_storage_path: { label: 'Manifest Path', type: 'text' },
        b_mta_sent_date: { label: 'MTA Sent Date', type: 'date' },
        mta_signed_date: { label: 'MTA Signed Date', type: 'date' },
        mta_storage_path: { label: 'MTA Path', type: 'text' }
      },
      displayField: item => `Request #${item.id}`,
      secondaryField: item => item.request_date
    },
    metadata: {
      title: 'Metadata',
      icon: TestTube,
      endpoint: '/metadata/',
      fields: {
        request: { label: 'Request', type: 'select', required: true, options: 'requests' },
        original_sample_id: { label: 'Original Sample ID', type: 'text', required: true },
        scientific_name: { label: 'Scientific Name', type: 'text', required: true },
        taxon_group: { label: 'Taxon Group', type: 'text' },
        family: { label: 'Family', type: 'text' },
        genus: { label: 'Genus', type: 'text' },
        collector_sample_id: { label: 'Collector Sample ID', type: 'text' },
        collected_by: { label: 'Collected By', type: 'text' },
        date_of_collection: { label: 'Collection Date', type: 'date' },
        collection_location: { label: 'Location', type: 'text' },
        decimal_latitude: { label: 'Latitude', type: 'number', step: '0.00000001' },
        decimal_longitude: { label: 'Longitude', type: 'number', step: '0.00000001' },
        elevation: { label: 'Elevation (m)', type: 'number' },
        habitat: { label: 'Habitat', type: 'textarea' }
      },
      displayField: item => item.scientific_name,
      secondaryField: item => item.original_sample_id
    },
    shipments: {
      title: 'Shipments',
      icon: Package,
      endpoint: '/shipments/',
      fields: {
        request: { label: 'Request', type: 'select', required: true, options: 'requests' },
        shipment_date: { label: 'Shipment Date', type: 'date' },
        accession_date: { label: 'Accession Date', type: 'date' },
        is_collection_b_labeled: { label: 'Collection B Labeled?', type: 'checkbox' },
        tracking_number: { label: 'Tracking Number', type: 'text' }
      },
      displayField: item => `Shipment #${item.id}`,
      secondaryField: item => item.tracking_number || 'No tracking'
    },
    tissues: {
      title: 'Tissues',
      icon: TestTube,
      endpoint: '/tissues/',
      fields: {
        request: { label: 'Request', type: 'select', required: true, options: 'requests' },
        shipment: { label: 'Shipment', type: 'select', required: true, options: 'shipments' },
        metadata: { label: 'Metadata', type: 'select', required: true, options: 'metadata' },
        tissue_barcode: { label: 'Barcode', type: 'text', required: true },
        is_in_jacq: { label: 'In JACQ?', type: 'checkbox' },
        tissue_sample_storage_location: { label: 'Storage Location', type: 'text', required: true }
      },
      displayField: item => item.tissue_barcode,
      secondaryField: item => item.tissue_sample_storage_location
    },
    dnaAliquots: {
      title: 'DNA Aliquots',
      icon: Dna,
      endpoint: '/dna-aliquots/',
      fields: {
        request: { label: 'Request', type: 'select', required: true, options: 'requests' },
        shipment: { label: 'Shipment', type: 'select', required: true, options: 'shipments' },
        metadata: { label: 'Metadata', type: 'select', required: true, options: 'metadata' },
        dna_aliquot_qr_code: { label: 'QR Code', type: 'text', required: true },
        is_in_database: { label: 'In Database?', type: 'checkbox' },
        dna_aliquot_storage_location: { label: 'Storage Location', type: 'text' }
      },
      displayField: item => item.dna_aliquot_qr_code,
      secondaryField: item => item.dna_aliquot_storage_location
    }
  };

  // Load all data usando apiRequest autenticado
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        Object.entries(tabConfig).map(async ([key, config]) => {
          try {
            const result = await apiRequest(config.endpoint);
            const items = Array.isArray(result) ? result : (result.results || result.data || []);
            console.log(`Loaded ${key}:`, items);
            return [key, items];
          } catch (err) {
            console.error(`Error loading ${key}:`, err);
            return [key, []];
          }
        })
      );
      
      const newData = Object.fromEntries(results);
      setData(newData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAllData();
  }, []);

  // Create new item usando apiRequest autenticado
  const createItem = async (itemData) => {
    setLoading(true);
    setError('');
    try {
      const config = tabConfig[activeTab];
      const newItem = await apiRequest(config.endpoint, {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
      
      setData(prev => ({
        ...prev,
        [activeTab]: Array.isArray(prev[activeTab]) 
          ? [...prev[activeTab], newItem]
          : [newItem]
      }));
      setSuccess('Item created successfully');
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update existing item usando apiRequest autenticado
  const updateItem = async (id, itemData) => {
    setLoading(true);
    setError('');
    try {
      const config = tabConfig[activeTab];
      const updatedItem = await apiRequest(`${config.endpoint}${id}/`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });
      
      setData(prev => ({
        ...prev,
        [activeTab]: Array.isArray(prev[activeTab])
          ? prev[activeTab].map(item => item.id === id ? updatedItem : item)
          : [updatedItem]
      }));
      setSuccess('Item updated successfully');
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete item usando apiRequest autenticado
  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const config = tabConfig[activeTab];
      await apiRequest(`${config.endpoint}${id}/`, {
        method: 'DELETE',
      });
      
      setData(prev => ({
        ...prev,
        [activeTab]: Array.isArray(prev[activeTab])
          ? prev[activeTab].filter(item => item.id !== id)
          : []
      }));
      setSuccess('Item deleted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    const processedData = { ...formData };
    
    // Convert checkboxes to integers (Django expects 1/0)
    Object.entries(tabConfig[activeTab].fields).forEach(([key, field]) => {
      if (field.type === 'checkbox') {
        processedData[key] = processedData[key] ? 1 : 0;
      }
    });

    if (editingItem) {
      updateItem(editingItem.id, processedData);
    } else {
      createItem(processedData);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({});
    setShowForm(false);
    setEditingItem(null);
  };

  // Initialize form with default data
  const initForm = (item = null) => {
    const config = tabConfig[activeTab];
    const initialData = {};
    
    Object.entries(config.fields).forEach(([key, field]) => {
      if (item) {
        initialData[key] = item[key] || (field.type === 'checkbox' ? false : '');
      } else {
        initialData[key] = field.type === 'checkbox' ? false : '';
      }
    });
    
    setFormData(initialData);
    setEditingItem(item);
    setShowForm(true);
  };

  // Filter items based on search
  const getFilteredItems = () => {
    const items = data[activeTab];
    const config = tabConfig[activeTab];
    
    if (!Array.isArray(items)) {
      console.log('Items is not an array:', items);
      return [];
    }
    
    if (!searchTerm.trim()) {
      return items;
    }
    
    return items.filter(item => {
      try {
        const displayText = config.displayField(item)?.toLowerCase() || '';
        const secondaryText = config.secondaryField(item)?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return displayText.includes(search) || secondaryText.includes(search);
      } catch (error) {
        console.error('Error filtering item:', item, error);
        return false;
      }
    });
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Get options for select fields
  const getSelectOptions = (optionsKey) => {
    const items = data[optionsKey];
    const config = tabConfig[optionsKey];
    
    if (!Array.isArray(items)) {
      return [];
    }
    
    return items.map(item => ({
      value: item.id,
      label: config.displayField(item)
    }));
  };

  const currentConfig = tabConfig[activeTab];
  const CurrentIcon = currentConfig.icon;
  const filteredItems = getFilteredItems();

  return (
    <div className="app-container">
      {/* Header con información de usuario */}
      <div className="header">
        <div className="header-content">
          <div className="header-flex">
            <div>
              <h1 className="header-title">Biological Sample Management System</h1>
              <p className="header-subtitle">Manage requesters, requests, metadata, and samples</p>
              <p className="user-welcome">Bienvenido, {user?.first_name} {user?.last_name || user?.username}!</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => initForm()}
                className="new-item-button"
              >
                <Plus size={20} />
                New {currentConfig.title.slice(0, -1)}
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Resto del componente igual... */}
      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-content">
          <div className="tabs-flex">
            {Object.entries(tabConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setSearchTerm('');
                  }}
                  className={`tab-button ${isActive ? 'active' : 'inactive'}`}
                >
                  <Icon size={16} />
                  {config.title}
                  <span className="tab-count">
                    {Array.isArray(data[key]) ? data[key].length : 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Barra de búsqueda */}
        <div className="search-container">
          <div className="search-input-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder={`Buscar en ${currentConfig.title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {/* Formulario Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  <CurrentIcon size={24} />
                  {editingItem ? 'Edit' : 'New'} {currentConfig.title.slice(0, -1)}
                </h2>
                <button
                  onClick={resetForm}
                  className="modal-close-button"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                {Object.entries(currentConfig.fields).map(([key, field]) => (
                  <div key={key} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required-asterisk">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        rows="3"
                        className="form-textarea"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="form-select"
                      >
                        <option value="">Select...</option>
                        {getSelectOptions(field.options).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData[key] || false}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                          className="checkbox-input"
                        />
                        {field.label}
                      </label>
                    ) : (
                      <input
                        type={field.type}
                        step={field.step}
                        value={formData[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="form-input"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="save-button"
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de items */}
        <div className="items-container">
          <div className="items-header">
            <h2 className="items-title">
              <CurrentIcon size={24} />
              {currentConfig.title} ({filteredItems.length})
            </h2>
          </div>

          {loading && !showForm ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span className="loading-text">Loading...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? `No ${currentConfig.title.toLowerCase()} found matching your search` : `No ${currentConfig.title.toLowerCase()} available`}
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <div className="item-content">
                      <h3 className="item-title">
                        {currentConfig.displayField(item)}
                      </h3>
                      <p className="item-subtitle">
                        {currentConfig.secondaryField(item)}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => initForm(item)}
                        className="action-button edit-button"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="action-button delete-button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="item-meta">
                    ID: {item.id}
                    {item.created_at && (
                      <span className="block">Created: {new Date(item.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal con AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;