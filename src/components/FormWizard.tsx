import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, X } from 'lucide-react';
import ManufacturingStep from './steps/ManufacturingStep';
import ProductConditionsStep from './steps/ProductConditionsStep';
import OrderDetailsStep from './steps/OrderDetailsStep';
import RemarksStep from './steps/RemarksStep';
import ExtraStep from './steps/ExtraStep';
import ConfirmationStep from './steps/ConfirmationStep';

export interface FormData {
  manufacturer: string;
  shipTo: string;
  authorizedBy: string;
  productFamily: string;
  shippedVia: string;
  estimatedDelivery: Date | null;
  terms: string;
  products: { [key: string]: number };
  remarks: string;
  packageInstructions: {
    bottle: string;
    bottleTop: string;
    customFields: { label: string; value: string }[];
  };
  extraFields: { label: string; value: string }[];
  email: string;
}

interface FormWizardProps {
  onCancel: () => void;
}

const FormWizard: React.FC<FormWizardProps> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    manufacturer: '',
    shipTo: '',
    authorizedBy: '',
    productFamily: '',
    shippedVia: '',
    estimatedDelivery: null,
    terms: '',
    products: {},
    remarks: '',
    packageInstructions: {
      bottle: '',
      bottleTop: '',
      customFields: []
    },
    extraFields: [],
    email: ''
  });

  const totalSteps = 6;

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && !isSubmitted) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmitted = () => {
    setIsSubmitted(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ManufacturingStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <ProductConditionsStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <OrderDetailsStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <RemarksStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <ExtraStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <ConfirmationStep formData={formData} onFormSubmitted={handleFormSubmitted} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = [
      'Manufacturing',
      'Product and Conditions',
      'Order Details',
      'Remarks',
      'Extra Fields',
      'Confirmation'
    ];
    return titles[currentStep - 1];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Order Form</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                {isSubmitted ? 'Go to Home' : 'Cancel'}
              </Button>
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center space-x-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 === currentStep
                      ? 'bg-blue-600 text-white'
                      : i + 1 < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`h-1 w-12 mx-2 ${
                      i + 1 < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold">{getStepTitle()}</h3>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          {/* Navigation buttons */}
          {currentStep < totalSteps && !isSubmitted && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={nextStep}>
                Next
              </Button>
            </div>
          )}

          {/* Back button for confirmation step - only show if not submitted */}
          {currentStep === totalSteps && !isSubmitted && (
            <div className="flex justify-start mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormWizard;
