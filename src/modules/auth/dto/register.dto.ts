import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { USER_TYPE } from 'src/common/constant';
import { BloodGroup } from 'src/modules/user/entities/patient-profile.entity';

class DoctorProfileDto {
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  registrationNo?: string;

  @IsNumber()
  @IsOptional()
  yearsExperience?: number;

  @IsString()
  @IsOptional()
  clinicName?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}

class PatientProfileDto {
  @IsEnum(BloodGroup)
  @IsOptional()
  bloodGroup?: BloodGroup;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsNumber()
  @IsOptional()
  heightCm?: number;

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  chronicDiseases?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  userTypeId: number;

  @ValidateNested()
  @Type(() => DoctorProfileDto)
  @IsOptional()
  doctorProfile?: DoctorProfileDto;

  @ValidateNested()
  @Type(() => PatientProfileDto)
  @IsOptional()
  patientProfile?: PatientProfileDto;
}
