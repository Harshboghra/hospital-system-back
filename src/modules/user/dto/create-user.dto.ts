import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  ValidateIf,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { USER_TYPE } from 'src/common/constant';
import { BloodGroup } from '../entities/patient-profile.entity';

export class DoctorProfileDto {
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

export class PatientProfileDto {
  @IsEnum(BloodGroup)
  @IsOptional()
  bloodGroup?: BloodGroup;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date | string;

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

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsNumber()
  userTypeId: number;

  @ValidateIf((o) => o.userTypeId === USER_TYPE.DOCTOR)
  @ValidateNested()
  @Type(() => DoctorProfileDto)
  doctorProfile?: DoctorProfileDto;

  @ValidateIf((o) => o.userTypeId === USER_TYPE.PATIENT)
  @ValidateNested()
  @Type(() => PatientProfileDto)
  patientProfile?: PatientProfileDto;
}
