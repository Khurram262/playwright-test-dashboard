import {expect} from '@playwright/test';
export class SignupPage {
  constructor(page) {
    this.page = page;
    this.otpinput1 = page.getByTestId('signup-otp-input-0');
    this.otpinput2 = page.getByTestId('signup-otp-input-1');
    this.otpinput3 = page.getByTestId('signup-otp-input-2');
    this.otpinput4 = page.getByTestId('signup-otp-input-3');
    this.otpinput5 = page.getByTestId('signup-otp-input-4');
    this.otpinput6 = page.getByTestId('signup-otp-input-5');
    this.registerButton = page.getByTestId('auth-tab-register');
    this.fullNameInput = page.getByTestId('signup-full-name');
    this.emailInput = page.getByTestId('signup-email');
    this.phoneInput = page.getByRole('textbox', { name: 'Enter phone number' });
    this.passwordInput = page.getByTestId('signup-password');
    this.confirmPasswordInput = page.getByTestId('signup-confirm-password');
    this.selectRoleDropdown = page.getByTestId('signup-user-type');
    this.selectRoleButton = page.getByRole('option', { name: 'Job Seeker' }); 
    this.signUpButton = page.getByTestId('signup-submit-button');
    this.emailExistsError = page.getByText('An account with this email already exists',{ exact: false });
  }

  async goto() {
    await this.page.goto('https://recruitai-web-production.up.railway.app/auth');
    await this.page.waitForLoadState('domcontentloaded');
    console.log('Signup page opened');
  }

  async register() {
    await this.registerButton.click();

  }

  async enterFullName(fullName) {
    await this.fullNameInput.waitFor({ state: 'visible' });
    await this.fullNameInput.pressSequentially(fullName);
    console.log('Full name entered');
  }
  async enterEmail(email) {
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.pressSequentially(email);
    console.log('Email entered');
  }
  async enterPhone(phone) {
    await this.phoneInput.waitFor({ state: 'visible' });
    await this.phoneInput.fill(''); 
    await this.phoneInput.pressSequentially(phone);
    console.log('Phone number entered');
  }
  async enterPassword(password) {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.pressSequentially(password);
    console.log('Password entered');
  }
  async enterConfirmPassword(confirmPassword) {
    await this.confirmPasswordInput.waitFor({ state: 'visible' });
    await this.confirmPasswordInput.pressSequentially(confirmPassword);
    console.log('Confirm password entered');
  }
  async selectRole(role) {
    await this.selectRoleDropdown.click();
    await this.selectRoleButton.click(role);
    console.log('Role selected');
    
  }
    async createAccount() {
  await this.signUpButton.click();
  console.log('clicked on create account.');
}
async fillOTP(otp) {
    const digits = otp.split('');
    if (digits.length !== 6) {
      throw new Error('OTP must be exactly 6 digits.');
    }
    await this.otpinput1.waitFor({ state: 'visible' });
    await this.otpinput1.fill(digits[0]);
    await this.otpinput2.fill(digits[1]);
    await this.otpinput3.fill(digits[2]);
    await this.otpinput4.fill(digits[3]);
    await this.otpinput5.fill(digits[4]);
    await this.otpinput6.fill(digits[5]);
    console.log('OTP entered');
  }
}
