import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import api from '../../../utils/api';

const Expenses = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [expenses, setExpenses] = useState([]);
	const [filters, setFilters] = useState({
		status: '',
		vendorId: '',
		driverId: '',
		category: '',
		startDate: '',
		endDate: '',
	});
	const [selectedExpense, setSelectedExpense] = useState(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [assigning, setAssigning] = useState(false);
	const [chargedTo, setChargedTo] = useState('vendor');

	useEffect(() => {
		fetchExpenses();
	}, []);

	useEffect(() => {
		fetchExpenses();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters]);

	const fetchExpenses = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			Object.entries(filters).forEach(([k, v]) => {
				if (v) params.append(k, v);
			});
			const res = await api.get(`/admin/expenses?${params.toString()}`);
			setExpenses(res.data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const openDetails = async (exp) => {
		try {
			const res = await api.get(`/admin/expenses/${exp._id}`);
			setSelectedExpense(res.data);
			setChargedTo(res.data.chargedTo || 'vendor');
			setDetailsOpen(true);
		} catch (e) {
			console.error(e);
		}
	};

	const assignExpense = async () => {
		try {
			setAssigning(true);
			await api.put(`/admin/expenses/${selectedExpense._id}/assign`, { chargedTo });
			await fetchExpenses();
			setDetailsOpen(false);
			setSelectedExpense(null);
		} catch (e) {
			alert(e.response?.data?.message || 'Failed to assign expense');
		} finally {
			setAssigning(false);
		}
	};

	const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
	const formatDate = (date) => {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
	};

	if (loading && expenses.length === 0) {
		return (
			<div className="space-y-4 sm:space-y-6">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin • Expenses</h1>
				<Card>
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						<p className="mt-4 text-gray-600">{t('common.loading')}</p>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			<h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin • Expenses</h1>
			<Card>
				<div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
						<select
							className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
							value={filters.status}
							onChange={(e) => setFilters({ ...filters, status: e.target.value })}
						>
							<option value="">All</option>
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
							<option value="paid">Paid</option>
						</select>
					</div>
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
						<Input
							className="mb-0"
							value={filters.vendorId}
							onChange={(e) => setFilters({ ...filters, vendorId: e.target.value })}
							placeholder="Vendor ObjectId"
						/>
					</div>
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Driver ID</label>
						<Input
							className="mb-0"
							value={filters.driverId}
							onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
							placeholder="Driver ObjectId"
						/>
					</div>
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.startDate')}</label>
						<Input
							type="date"
							className="mb-0"
							value={filters.startDate}
							onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
						/>
					</div>
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{t('vendor.endDate')}</label>
						<Input
							type="date"
							className="mb-0"
							value={filters.endDate}
							onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
						/>
					</div>
				</div>
			</Card>

			<Card className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[900px]">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.date')}</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.driver')}</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.category')}</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vendor.amount')}</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charged To</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{expenses.length === 0 ? (
								<tr>
									<td colSpan="8" className="px-4 py-8 text-center text-gray-500">
										{t('vendor.noExpenses')}
									</td>
								</tr>
							) : (
								expenses.map((e) => (
									<tr key={e._id} className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm">{formatDate(e.expenseDate)}</td>
										<td className="px-4 py-3 text-sm">{e.vendorId}</td>
										<td className="px-4 py-3 text-sm">{e.driverId?.name || 'N/A'}</td>
										<td className="px-4 py-3 text-sm">{e.category}</td>
										<td className="px-4 py-3 text-sm text-right">{formatCurrency(e.amount)}</td>
										<td className="px-4 py-3 text-sm">{e.status}</td>
										<td className="px-4 py-3 text-sm">{e.chargedTo || 'vendor'}</td>
										<td className="px-4 py-3 text-sm">
											<Button size="small" variant="outline" onClick={() => openDetails(e)}>
												{t('vendor.viewDetails')}
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>

			{detailsOpen && selectedExpense && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
					<div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-auto max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold text-gray-800">{t('vendor.expenseDetails')}</h2>
							<button onClick={() => { setDetailsOpen(false); setSelectedExpense(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
						</div>
						<div className="space-y-3 text-sm">
							<div className="grid grid-cols-2 gap-4">
								<div><span className="text-gray-600">{t('vendor.date')}:</span> <span className="ml-2 font-medium">{formatDate(selectedExpense.expenseDate)}</span></div>
								<div><span className="text-gray-600">{t('common.status')}:</span> <span className="ml-2 font-medium">{selectedExpense.status}</span></div>
								<div><span className="text-gray-600">Vendor:</span> <span className="ml-2 font-medium">{selectedExpense.vendorId}</span></div>
								<div><span className="text-gray-600">{t('vendor.driver')}:</span> <span className="ml-2 font-medium">{selectedExpense.driverId?.name || 'N/A'}</span></div>
								<div><span className="text-gray-600">{t('vendor.category')}:</span> <span className="ml-2 font-medium">{selectedExpense.category}</span></div>
								<div><span className="text-gray-600">{t('vendor.amount')}:</span> <span className="ml-2 font-medium text-primary">{formatCurrency(selectedExpense.amount)}</span></div>
								<div><span className="text-gray-600">Charged To:</span>
									<select
										value={chargedTo}
										onChange={(e) => setChargedTo(e.target.value)}
										className="ml-2 px-2 py-1 border border-gray-300 rounded"
									>
										<option value="vendor">Vendor</option>
										<option value="driver" disabled={selectedExpense.category === 'fuel'}>Driver</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end gap-2 mt-4">
								<Button variant="primary" onClick={assignExpense} disabled={assigning}>
									{assigning ? t('common.loading') : 'Assign'}
								</Button>
								<Button variant="outline" onClick={() => { setDetailsOpen(false); setSelectedExpense(null); }}>
									{t('common.cancel')}
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Expenses;


