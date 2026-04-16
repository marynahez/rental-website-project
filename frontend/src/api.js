import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export const getUsers        = (params) => api.get('/users/', { params });
export const loginUser       = (email) => api.post('/login/', { email });
export const createUser      = (data)   => api.post('/users/', data);
export const getProperties   = (params) => api.get('/properties/', { params });
export const getListings     = (params) => api.get('/listings/', { params });
export const getAppointments = (params) => api.get('/appointments/', { params });
export const getTimeslots    = (params) => api.get('/timeslots/', { params });
export const getLeases       = (params) => api.get('/leases/', { params });
export const getPayments     = (params) => api.get('/payments/', { params });
export const getRequests     = (params) => api.get('/requests/', { params });

export const confirmAppointment  = (id) => api.post(`/appointments/${id}/confirm/`);
export const cancelAppointment   = (id) => api.post(`/appointments/${id}/cancel/`);
export const completeAppointment = (id) => api.post(`/appointments/${id}/complete/`);

export const approvePayment = (id) => api.post(`/payments/${id}/approve/`);

export const approveRequest  = (id) => api.post(`/requests/${id}/approve/`);
export const rejectRequest   = (id) => api.post(`/requests/${id}/reject/`);
export const completeRequest = (id) => api.post(`/requests/${id}/complete/`);

export const createAppointment = (data) => api.post('/appointments/', data);
export const createTimeslot    = (data) => api.post('/timeslots/', data);
export const createRequest     = (data) => api.post('/requests/', data);

export const createProperty  = (data)   => api.post('/properties/', data);
export const updateProperty  = (id, data) => api.patch(`/properties/${id}/`, data);
export const deleteProperty  = (id)     => api.delete(`/properties/${id}/`);

export const createLease = (data) => api.post('/leases/', data);
export const deleteLease = (id) => api.delete(`/leases/${id}/`);

export const createListing = (data) => api.post('/listings/', data);
export const updateListing = (id, data) => api.patch(`/listings/${id}/`, data);
export const deleteListing = (id) => api.delete(`/listings/${id}/`);

export const createPayment = (data) => api.post('/payments/', data);
export const failPayment   = (id)   => api.post(`/payments/${id}/fail/`);

// Atomic booking with duplicate-slot check
export const bookAppointment = (data) => api.post('/appointments/book/', data);