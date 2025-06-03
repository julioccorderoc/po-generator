
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Send, AlertCircle } from 'lucide-react';
import { FormData } from '../FormWizard';
import { useToast } from '@/components/ui/use-toast';

interface ConfirmationStepProps {
  formData: FormData;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Log to console
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    
    try {
      // POST to the endpoint
      const response = await fetch('https://juliotest.requestcatcher.com/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        mode: 'no-cors' // Add this to handle CORS issues
      });
      
      console.log('Submission successful');
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Your order has been submitted successfully.",
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
              {Object.entries(formData.products).map(([productId, quantity]) => (
                <div key={productId} className="flex justify-between text-sm">
                  <span>{productId}</span>
                  <span>Quantity: {quantity}</span>
                </div>
              ))}
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

      {/* Submit Button */}
      <div className="text-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>Submitting...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
