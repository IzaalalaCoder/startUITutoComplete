import { Stack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/Form';

import { FormFieldsProject } from './schemas';

export const ProjectForm = () => {
  const form = useFormContext<FormFieldsProject>();

  return (
    <Stack spacing={4}>
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldController control={form.control} type="text" name="name" />
      </FormField>

      <FormField>
        <FormFieldLabel>Description</FormFieldLabel>
        <FormFieldController
          control={form.control}
          type="textarea"
          name="description"
          rows={6}
        />
      </FormField>
    </Stack>
  );
};
