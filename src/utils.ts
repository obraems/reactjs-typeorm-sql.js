// utils.ts
import User from './entity/User';

export const generateRandomString = (length: number) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateRandomName = () => {
  const firstName = generateRandomString(5);
  const lastName = generateRandomString(7);
  return `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`;
};

export const generateRandomEmail = (name: string) => {
  const domain = 'example.com';
  const emailName = name.toLowerCase().replace(' ', '.');
  return `${emailName}@${domain}`;
};

export const generateRandomUser = () => {
  const user = new User();
  user.name = generateRandomName();
  user.email = generateRandomEmail(user.name);
  return user;
};
