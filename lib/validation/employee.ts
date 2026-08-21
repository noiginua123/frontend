import { z } from 'zod';
import {
  ADM002_MESSAGES,
  EMPLOYEE_NAME_MAX_LENGTH,
} from '@/constants/adm002';

export const employeeSearchSchema = z.object({
  fullname: z.string().max(
    EMPLOYEE_NAME_MAX_LENGTH,
    ADM002_MESSAGES.fullnameMaxLength,
  ),
  departmentId: z.string(),
});

export type EmployeeSearchFormData = z.infer<typeof employeeSearchSchema>;
