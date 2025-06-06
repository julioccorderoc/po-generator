import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Calendar, User, MapPin, FileText, Settings } from 'lucide-react';
import { FormData } from '../FormWizard';
import { transformFormDataToPurchaseOrder } from '@/utils/dataTransform';
import { formatMoney, formatNumber } from '@/utils/formatters';
import EmailModal from '../EmailModal';

interface ConfirmationStepProps {
	formData: FormData;
	onFormSubmitted: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData, onFormSubmitted }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [showEmailModal, setShowEmailModal] = useState(false);
	const [orderSummary, setOrderSummary] = useState<any>(null);
	const [poNumber, setPoNumber] = useState<string>('');

	// Calculate order totals
	useEffect(() => {
		const calculateTotals = async () => {
			if (!formData.manufacturer || formData.productFamilies.length === 0) return;

			try {
				const [productsRes, manufacturerProductsRes, otherItemsRes] = await Promise.all([
					fetch('/data/products.json'),
					fetch('/data/manufacturer_products.json'),
					fetch('/data/other_items.json')
				]);

				const [productsData, manufacturerProductsData, otherItemsData] = await Promise.all([
					productsRes.json(),
					manufacturerProductsRes.json(),
					otherItemsRes.json()
				]);

				let allProducts: any[] = [];
				formData.productFamilies.forEach(familyId => {
					const familyProducts = productsData[familyId] || [];
					const manufacturerProducts = manufacturerProductsData[formData.manufacturer]?.[familyId] || [];

					familyProducts.forEach((product: any) => {
						const manufacturerProduct = manufacturerProducts.find((mp: any) => mp.id === product.id);
						if (manufacturerProduct) {
							allProducts.push({
								...product,
								price: manufacturerProduct.price
							});
						}
					});
				});

				const manufacturerOtherItems = otherItemsData[formData.manufacturer] || [];
				const selectedProducts = [...allProducts, ...manufacturerOtherItems]
					.filter(product => formData.products[product.id] > 0)
					.map(product => ({
						...product,
						quantity: formData.products[product.id],
						total: formData.products[product.id] * product.price
					}));

				const standardProductsCount = allProducts
					.filter(product => formData.products[product.id] > 0)
					.reduce((sum, product) => sum + formData.products[product.id], 0);

				const totalAmount = selectedProducts.reduce((sum, product) => sum + product.total, 0);
				const totalItems = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);

				setOrderSummary({
					products: selectedProducts,
					standardProductsCount,
					totalAmount,
					totalItems
				});
			} catch (error) {
				console.error('Error calculating totals:', error);
			}
		};

		calculateTotals();
	}, [formData]);

	const handleSubmit = async (email: string) => {
		setIsSubmitting(true);
		setShowEmailModal(false);

		try {
			// Get next PO number
			const posResponse = await fetch('/data/pos.json');
			if (!posResponse.ok) {
				throw new Error(`Failed to fetch POs: ${posResponse.status}`);
			}
			const existingPos = await posResponse.json();
			const nextPoNumber = existingPos.length > 0
				? Math.max(...existingPos.map((po: any) => parseInt(po.po_number || po.doc_id))) + 1
				: 1;
			const poNumberStr = nextPoNumber.toString();
			setPoNumber(poNumberStr);

			// Transform form data to purchase order
			const purchaseOrder = await transformFormDataToPurchaseOrder({
				...formData,
				email
			}, poNumberStr);

			// 2. Trigger download in browser
			const blob = new Blob([JSON.stringify(purchaseOrder, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `PO_${poNumberStr}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			// 1. Send to API endpoint using a CORS proxy for testing
			const { formConfig } = await import('@/config/formConfig');
			await fetch('/api/send_form_data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(purchaseOrder)
			});

			setIsSubmitted(true);
			onFormSubmitted();
		} catch (error) {
			console.error('Error submitting order:', error);
			alert('Error submitting order. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="text-center py-12">
				<div className="flex justify-center mb-6">
					<div className="bg-green-100 rounded-full p-4">
						<CheckCircle className="h-12 w-12 text-green-600" />
					</div>
				</div>
				<h2 className="text-2xl font-bold text-green-800 mb-4">
					🎉 Order Successfully Submitted!
				</h2>
				<p className="text-gray-600 mb-2">
					Your purchase order #{poNumber} has been created and sent.
				</p>
				<p className="text-gray-600 mb-6">
					Thank you for your business! We'll process your order shortly.
				</p>
				<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 inline-block">
					<div className="flex items-center gap-2 text-green-800">
						<Package className="h-5 w-5" />
						<span className="font-medium">PO #{poNumber} - {formatMoney(orderSummary?.totalAmount || 0)}</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h3 className="text-xl font-semibold mb-2">Review Your Order</h3>
				<p className="text-gray-600">Please review all details before submitting your purchase order.</p>
			</div>

			{/* Order Summary at the top */}
			{orderSummary && (
				<Card className="border-2 border-green-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-green-800">
							<Package className="h-5 w-5" />
							Order Summary - {formatMoney(orderSummary.totalAmount)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{orderSummary.products.map((product: any, index: number) => (
								<div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
									<div>
										<div className="font-medium">{product.name}</div>
										<div className="text-sm text-gray-500">
											{formatNumber(product.quantity)} × {formatMoney(product.price)}
										</div>
									</div>
									<div className="font-medium">{formatMoney(product.total)}</div>
								</div>
							))}

							<div className="pt-4 border-t space-y-2">
								<div className="flex justify-between text-sm">
									<span>Total Standard Products:</span>
									<span>{formatNumber(orderSummary.standardProductsCount)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Total Items:</span>
									<span>{formatNumber(orderSummary.totalItems)}</span>
								</div>
								<div className="flex justify-between text-lg font-bold">
									<span>Grand Total:</span>
									<span className="text-green-600">{formatMoney(orderSummary.totalAmount)}</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Order Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							Order Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<span className="font-medium">Manufacturer:</span> {formData.manufacturer}
						</div>
						<div>
							<span className="font-medium">Product Families:</span> {formData.productFamilies.join(', ')}
						</div>
						<div>
							<span className="font-medium">Ship To:</span> {formData.shipTo}
						</div>
						<div>
							<span className="font-medium">Shipping Method:</span> {formData.shippedVia}
						</div>
						<div>
							<span className="font-medium">Payment Terms:</span> {formData.terms}
						</div>
					</CardContent>
				</Card>

				{/* Delivery & Authorization */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Delivery & Authorization
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<span className="font-medium">Estimated Delivery:</span>{' '}
							{formData.estimatedDelivery ? formData.estimatedDelivery.toLocaleDateString() : 'Not specified'}
						</div>
						<div>
							<span className="font-medium">Authorized By:</span> {formData.authorizedBy}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Packaging Instructions */}
			{(Object.keys(formData.packageInstructions).some(key =>
				key !== 'customFields' && formData.packageInstructions[key as keyof typeof formData.packageInstructions]
			) || formData.packageInstructions.customFields.length > 0) && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								Packaging Instructions
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{Object.entries(formData.packageInstructions).map(([key, value]) => {
								if (key === 'customFields' || !value) return null;
								return (
									<div key={key}>
										<span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {value as string}
									</div>
								);
							})}
							{formData.packageInstructions.customFields.map((field, index) => (
								field.label && field.value && (
									<div key={index}>
										<span className="font-medium">{field.label}:</span> {field.value}
									</div>
								)
							))}
						</CardContent>
					</Card>
				)}

			{/* Custom Fields */}
			{formData.extraFields.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Custom Fields
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{formData.extraFields.map((field, index) => (
							field.label && field.value && (
								<div key={index}>
									<span className="font-medium">{field.label}:</span> {field.value}
								</div>
							)
						))}
					</CardContent>
				</Card>
			)}

			{/* Remarks */}
			{formData.remarks && (
				<Card>
					<CardHeader>
						<CardTitle>Remarks</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-700">{formData.remarks}</p>
					</CardContent>
				</Card>
			)}

			{/* Submit Button */}
			<div className="flex justify-center pt-6">
				<Button
					onClick={() => setShowEmailModal(true)}
					disabled={isSubmitting}
					className="px-8 py-3 text-lg"
				>
					{isSubmitting ? 'Submitting...' : 'Send Order'}
				</Button>
			</div>

			{/* Email Modal */}
			<EmailModal
				isOpen={showEmailModal}
				onClose={() => setShowEmailModal(false)}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
};

export default ConfirmationStep;
