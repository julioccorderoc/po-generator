
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FormData } from '../FormWizard';

interface RemarksStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const RemarksStep: React.FC<RemarksStepProps> = ({ formData, updateFormData }) => {
  const addCustomField = () => {
    const updatedInstructions = {
      ...formData.packageInstructions,
      customFields: [
        ...formData.packageInstructions.customFields,
        { label: '', value: '' }
      ]
    };
    updateFormData({ packageInstructions: updatedInstructions });
  };

  const updateCustomField = (index: number, field: 'label' | 'value', value: string) => {
    const updatedFields = [...formData.packageInstructions.customFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    
    const updatedInstructions = {
      ...formData.packageInstructions,
      customFields: updatedFields
    };
    updateFormData({ packageInstructions: updatedInstructions });
  };

  const removeCustomField = (index: number) => {
    const updatedFields = formData.packageInstructions.customFields.filter((_, i) => i !== index);
    const updatedInstructions = {
      ...formData.packageInstructions,
      customFields: updatedFields
    };
    updateFormData({ packageInstructions: updatedInstructions });
  };

  return (
    <div className="space-y-8">
      {/* Remarks Section */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Enter any additional remarks or notes..."
          value={formData.remarks}
          onChange={(e) => updateFormData({ remarks: e.target.value })}
          rows={4}
        />
      </div>

      {/* Package Instructions Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Package Instructions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bottle">Bottle</Label>
            <Input
              id="bottle"
              value={formData.packageInstructions.bottle}
              onChange={(e) => updateFormData({
                packageInstructions: {
                  ...formData.packageInstructions,
                  bottle: e.target.value
                }
              })}
              placeholder="Bottle specifications"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bottleTop">Bottle Top</Label>
            <Input
              id="bottleTop"
              value={formData.packageInstructions.bottleTop}
              onChange={(e) => updateFormData({
                packageInstructions: {
                  ...formData.packageInstructions,
                  bottleTop: e.target.value
                }
              })}
              placeholder="Bottle top specifications"
            />
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Additional Custom Fields</h5>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomField}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>

          {formData.packageInstructions.customFields.map((field, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`custom-label-${index}`}>Label</Label>
                <Input
                  id={`custom-label-${index}`}
                  value={field.label}
                  onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                  placeholder="Field label"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`custom-value-${index}`}>Value</Label>
                <Input
                  id={`custom-value-${index}`}
                  value={field.value}
                  onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                  placeholder="Field value"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCustomField(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RemarksStep;
