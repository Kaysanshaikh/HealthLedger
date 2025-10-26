-- Migration: Add HH number columns to doctor_patient_access table
-- This enables proper role isolation when same wallet is used for multiple roles

-- Add columns if they don't exist
ALTER TABLE doctor_patient_access 
ADD COLUMN IF NOT EXISTS doctor_hh_number VARCHAR(10),
ADD COLUMN IF NOT EXISTS patient_hh_number VARCHAR(10);

-- Update existing records to populate HH numbers from wallet addresses
UPDATE doctor_patient_access dpa
SET doctor_hh_number = u.hh_number::text
FROM users u
WHERE LOWER(dpa.doctor_wallet) = LOWER(u.wallet_address)
  AND u.role = 'doctor'
  AND dpa.doctor_hh_number IS NULL;

UPDATE doctor_patient_access dpa
SET patient_hh_number = u.hh_number::text
FROM users u
WHERE LOWER(dpa.patient_wallet) = LOWER(u.wallet_address)
  AND u.role = 'patient'
  AND dpa.patient_hh_number IS NULL;

-- Make columns NOT NULL after populating
ALTER TABLE doctor_patient_access 
ALTER COLUMN doctor_hh_number SET NOT NULL,
ALTER COLUMN patient_hh_number SET NOT NULL;

-- Drop old unique constraint and add new one based on HH numbers
ALTER TABLE doctor_patient_access 
DROP CONSTRAINT IF EXISTS doctor_patient_access_doctor_wallet_patient_wallet_key;

ALTER TABLE doctor_patient_access 
ADD CONSTRAINT doctor_patient_access_doctor_hh_patient_hh_key 
UNIQUE (doctor_hh_number, patient_hh_number);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctor_patient_doctor_hh ON doctor_patient_access(doctor_hh_number);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_patient_hh ON doctor_patient_access(patient_hh_number);
