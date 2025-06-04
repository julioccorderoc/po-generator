import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Send, AlertCircle } from 'lucide-react';
import { FormData } from '../FormWizard';
import { useToast } from '@/hooks/use-toast';
import { formConfig } from '@/config/formConfig';
import EmailModal from '../EmailModal';
import { formatMoney, formatNumber } from '@/utils/formatters';
import { transformFormDataToPurchaseOrder } from '@/utils/dataTransform';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface ConfirmationStepProps {
  formData: FormData;
  onFormSubmitted: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData, onFormSubmitted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      if (!formData.manufacturer || !formData.productFamily) return;

      try {
        const [manufacturerProductsRes, otherItemsRes] = await Promise.all([
          fetch('/src/data/manufacturer_products.json'),
          fetch('/src/data/other_items.json')
        ]);
        
        const [manufacturerProductsData, otherItemsData] = await Promise.all([
          manufacturerProductsRes.json(),
          otherItemsRes.json()
        ]);

        const familyProducts = manufacturerProductsData[formData.manufacturer]?.[formData.productFamily] || [];
        const manufacturerOtherItems = otherItemsData[formData.manufacturer] || [];
        setAllProducts([...familyProducts, ...manufacturerOtherItems]);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, [formData.manufacturer, formData.productFamily]);

  const calculateSubtotal = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    const quantity = formData.products[productId] || 0;
    return product ? quantity * product.price : 0;
  };

  const calculateTotal = () => {
    return Object.keys(formData.products).reduce((total, productId) => {
      return total + calculateSubtotal(productId);
    }, 0);
  };

  const generatePONumber = async () => {
    try {
      const response = await fetch('/src/data/pos.json');
      const existingPOs = await response.json();
      return existingPOs.length + 1;
    } catch (error) {
      console.error('Error loading POs:', error);
      return 1;
    }
  };

  const savePO = async (email: string, poNumber: number) => {
    try {
      const response = await fetch('/src/data/pos.json');
      const existingPOs = await response.json();
      
      const newPO = {
        poNumber,
        total: calculateTotal(),
        manufacturer: formData.manufacturer,
        creationDate: new Date().toISOString(),
        expectedArrival: formData.estimatedDelivery ? formData.estimatedDelivery.toISOString() : null,
        createdBy: 'user',
        sentTo: email,
        lastUpdatedAt: '',
        status: ''
      };

      const updatedPOs = [...existingPOs, newPO];
      
      // In a real application, you would save this to a database
      console.log('Saving PO:', newPO);
      console.log('All POs:', updatedPOs);
      
      return newPO;
    } catch (error) {
      console.error('Error saving PO:', error);
      throw error;
    }
  };

  const handleSendOrder = () => {
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email: string) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const poNumber = await generatePONumber();
      const formDataWithEmail = { ...formData, email };
      
      // Transform and validate data
      const validatedPurchaseOrder = await transformFormDataToPurchaseOrder(formDataWithEmail, poNumber.toString());
      
      // Log the validated purchase order
      console.log('Validated Purchase Order:', JSON.stringify(validatedPurchaseOrder, null, 2));
      
      // POST to the configured endpoint
      const response = await fetch(formConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedPurchaseOrder),
        mode: 'no-cors'
      });
      
      // Save PO
      await savePO(email, poNumber);
      
      console.log('Submission successful');
      setIsSubmitted(true);
      setShowEmailModal(false);
      onFormSubmitted();
      
      toast({
        title: "Success!",
        description: `Your order #${poNumber} has been submitted successfully to ${email}.`,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to submit the form. Please try again.');
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-600 mb-2">Order Submitted Successfully!</h3>
        <p className="text-gray-600">Your order has been logged and submitted to the endpoint.</p>
        <p className="text-sm text-gray-500 mt-2">Check the console for the full form data.</p>
        <p className="text-sm text-gray-600 mt-4">Use the "Go to Home" button above to start a new order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium mb-2">Review Your Order</h4>
        <p className="text-sm text-gray-600">
          Please review all the information below before submitting your order.
        </p>
      </div>

      {/* Order Summary Card */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Order Total</span>
            <span className="text-2xl font-bold text-green-600">
              {formatMoney(calculateTotal())}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(formData.products).map(([productId, quantity]) => {
              const product = allProducts.find(p => p.id === productId);
              if (!product || quantity === 0) return null;
              
              return (
                <div key={productId} className="flex justify-between text-sm">
                  <span>{product.name} (×{formatNumber(quantity)})</span>
                  <span>{formatMoney(calculateSubtotal(productId))}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manufacturing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manufacturing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Manufacturer:</strong> {formData.manufacturer || 'Not selected'}</div>
            <div><strong>Ship To:</strong> {formData.shipTo || 'Not selected'}</div>
            <div className="col-span-2"><strong>Authorized By:</strong> {formData.authorizedBy || 'Not selected'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Product and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Product Family:</strong> {formData.productFamily || 'Not selected'}</div>
            <div><strong>Shipped Via:</strong> {formData.shippedVia || 'Not selected'}</div>
            <div><strong>Estimated Delivery:</strong> {formData.estimatedDelivery ? formData.estimatedDelivery.toLocaleDateString() : 'Not selected'}</div>
            <div><strong>Terms:</strong> {formData.terms || 'Not selected'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(formData.products).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(formData.products).map(([productId, quantity]) => {
                const product = allProducts.find(p => p.id === productId);
                if (!product || quantity === 0) return null;
                
                return (
                  <div key={productId} className="flex justify-between text-sm">
                    <span>{product.name} ({product.sku})</span>
                    <span>Quantity: {formatNumber(quantity)} × {formatMoney(product.price)} = {formatMoney(calculateSubtotal(productId))}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No products selected</p>
          )}
        </CardContent>
      </Card>

      {/* Remarks and Package Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Remarks & Package Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong className="text-sm">Remarks:</strong>
            <p className="text-sm text-gray-600 mt-1">{formData.remarks || 'None'}</p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <strong className="text-sm">Package Instructions:</strong>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Bottle: {formData.packageInstructions.bottle || 'None'}</div>
              <div>Bottle Top: {formData.packageInstructions.bottleTop || 'None'}</div>
            </div>
            
            {formData.packageInstructions.customFields.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Custom Fields:</div>
                {formData.packageInstructions.customFields.map((field, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {field.label}: {field.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Extra Fields */}
      {formData.extraFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.extraFields.map((field, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span><strong>{field.label}:</strong></span>
                  <span>{field.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-600 text-sm">{submitError}</span>
        </div>
      )}

      {/* Send Button */}
      <div className="text-center pt-6">
        <Button
          onClick={handleSendOrder}
          size="lg"
          className="min-w-[200px]"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Order
        </Button>
      </div>

      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ConfirmationStep;
