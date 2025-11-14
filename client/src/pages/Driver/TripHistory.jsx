import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Card from '../../components/Card';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './TripHistory.css';

const TripHistory = () => {
  const { t } = useTranslation();
  const [collections, setCollections] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    type: 'all', // all, collection, delivery
  });

  useEffect(() => {
    fetchTrips();
  }, [filter]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {},
      };

      if (filter.startDate) {
        config.params.startDate = filter.startDate;
      }
      if (filter.endDate) {
        config.params.endDate = filter.endDate;
      }

      if (filter.type === 'all' || filter.type === 'collection') {
        const collectionsRes = await axios.get('/api/collections', config);
        setCollections(collectionsRes.data || []);
      } else {
        setCollections([]);
      }

      if (filter.type === 'all' || filter.type === 'delivery') {
        const deliveriesRes = await axios.get('/api/deliveries', config);
        setDeliveries(deliveriesRes.data || []);
      } else {
        setDeliveries([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const allTrips = [
    ...collections.map((c) => ({ ...c, type: 'collection' })),
    ...deliveries.map((d) => ({ ...d, type: 'delivery' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return (
      <Container>
        <div className="loading-container">
          <p>{t('common.loading')}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="trip-history">
        <h1 className="page-title">{t('common.recent') || 'Trip History'}</h1>

        <Card>
          <div className="filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>{t('common.filter')}</label>
                <select
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  <option value="collection">{t('collection.title')}</option>
                  <option value="delivery">{t('delivery.title')}</option>
                </select>
              </div>

              <div className="filter-group">
                <Input
                  type="date"
                  name="startDate"
                  label={t('common.startDate') || 'Start Date'}
                  value={filter.startDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <Input
                  type="date"
                  name="endDate"
                  label={t('common.endDate') || 'End Date'}
                  value={filter.endDate}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="trips-list">
          {allTrips.length === 0 ? (
            <Card>
              <p className="no-trips">{t('common.noData') || 'No trips found'}</p>
            </Card>
          ) : (
            allTrips.map((trip) => (
              <Card key={trip._id} className="trip-card">
                <div className="trip-header">
                  <div className="trip-type-badge">
                    {trip.type === 'collection' ? t('collection.title') : t('delivery.title')}
                  </div>
                  <span className={`trip-status trip-status-${trip.status}`}>
                    {t(`${trip.type}.${trip.status}`)}
                  </span>
                </div>

                <div className="trip-details">
                  <div className="trip-info-row">
                    <span className="info-label">
                      {trip.type === 'collection' ? t('supplier.title') : t('society.title')}:
                    </span>
                    <span className="info-value">
                      {trip.supplierId?.name || trip.societyId?.name || 'N/A'}
                    </span>
                  </div>

                  <div className="trip-info-row">
                    <span className="info-label">{t('vehicle.title')}:</span>
                    <span className="info-value">
                      {trip.vehicleId?.vehicleNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="trip-info-row">
                    <span className="info-label">{t('collection.quantity')}:</span>
                    <span className="info-value">{trip.quantity}L</span>
                  </div>

                  <div className="trip-info-row">
                    <span className="info-label">
                      {trip.type === 'collection' ? t('collection.purchaseRate') : t('delivery.deliveryRate')}:
                    </span>
                    <span className="info-value">
                      ₹{trip.purchaseRate || trip.deliveryRate}
                    </span>
                  </div>

                  <div className="trip-info-row">
                    <span className="info-label">{t('collection.totalAmount')}:</span>
                    <span className="info-value amount">
                      ₹{trip.totalAmount || trip.purchaseAmount || trip.deliveryAmount}
                    </span>
                  </div>

                  <div className="trip-info-row">
                    <span className="info-label">{t('common.date') || 'Date'}:</span>
                    <span className="info-value">
                      {new Date(trip.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {trip.notes && (
                    <div className="trip-notes">
                      <span className="info-label">{t('collection.notes')}:</span>
                      <p>{trip.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

export default TripHistory;

