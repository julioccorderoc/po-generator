
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormWizard from '@/components/FormWizard';

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  const handleStartForm = () => {
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  if (showForm) {
    return <FormWizard onCancel={handleCancelForm} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Order Management System</CardTitle>
          <p className="text-gray-600 mt-2">
            Complete multi-step form to process your order
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={handleStartForm}
            size="lg"
            className="w-full"
          >
            Start Form
          </Button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>This form will guide you through:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Manufacturing details</li>
              <li>• Product selection</li>
              <li>• Order specifications</li>
              <li>• Package instructions</li>
              <li>• Custom fields</li>
              <li>• Final confirmation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
