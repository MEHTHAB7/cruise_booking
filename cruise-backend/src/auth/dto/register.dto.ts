import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message: 'Password must contain upper, lower, and number',
  })
  password: string;

  @IsString()
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Invalid characters in first name',
  })
  firstName: string;

  @IsString()
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Invalid characters in last name',
  })
  lastName: string;

  // ✅ FIXED — phone added safely
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+\-\s()]*$/, {
    message: 'Invalid phone number',
  })
  phone?: string;

  // ✅ FIXED — dob added safely
  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @IsBoolean()
  privacyAccepted: boolean;
}