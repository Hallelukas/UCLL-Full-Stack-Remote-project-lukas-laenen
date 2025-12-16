import PasswordValidator from 'password-validator';

const schema = new PasswordValidator();
schema
  .is().min(10)
  .is().max(128)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().symbols()

const validatePassword = (pwd: string) => {
  const errors = schema.validate(pwd, { list: true }) as string[];

  return {
    valid: errors.length === 0,
    details: errors
  };
};

export { validatePassword }