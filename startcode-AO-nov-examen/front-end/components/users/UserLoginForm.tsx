import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import UserService from '@services/UserService'
import { StatusMessage } from '@types'
import { useTranslation } from 'next-i18next'

const UserLoginForm: React.FC = () => {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [nameError, setNameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([])
  const router = useRouter()
  const [rememberMe, setRememberMe] = useState(false)
  const [pendingMFA, setPendingMFA] = useState(false)
  const [code, setCode] = useState('');

  const { t } = useTranslation()

  const clearErrors = () => {
    setNameError(null)
    setPasswordError(null)
    setStatusMessages([])
  }

  const validate = (): boolean => {
    let result = true

    if (!name || name.trim() === '') {
      setNameError(t('login.validate.name'))
      result = false
    }

    if (!password || password.trim() === '') {
      setPasswordError(t('login.validate.password'))
      result = false
    }

    return result
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearErrors();

    if (!validate()) return;

    const loginUser = { username: name, password };
    const response = await UserService.loginUser(loginUser);
    const result = await response.json();
      
    if (response.status === 200 && result.requiresMfa) {
      setStatusMessages([{ message: t('login.mfaRequired'), type: 'info' }]);

      sessionStorage.setItem('pendingMfaUser', name);

      setPendingMFA(true);
      return;
    }

    if (response.status === 200 && result.token) {
      setStatusMessages([{ message: t('login.success'), type: 'success' }]);

      sessionStorage.setItem(
        'loggedInUser',
        JSON.stringify({
          token: result.token,
          fullname: result.fullname,
          username: result.username,
          role: result.role,
        })
      );

      setTimeout(() => router.push('/'), 1500);
      return;
    } else {
      setStatusMessages([{ message: result.message, type: 'error' }]);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();

    const username = sessionStorage.getItem('pendingMfaUser') || '';
    if (!username) {
      return setStatusMessages([{ message: 'No login pending', type: 'error' }]);
    }

    try {
      const codeValue = code.trim();
      const response = await UserService.verifyMfaCode({ username, code: codeValue, rememberMe });
      const result = await response.json();

      if (response.status === 200) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(result));
        router.push('/');
      } else {
        setStatusMessages([{ message: result.message, type: 'error' }]);
      }
    } catch (err) {
      setStatusMessages([{ message: 'Error verifying', type: 'error' }]);
    }
  };

  return (
    <div className="max-w-sm m-auto">
      <div>
        <h3 className="px-0">{t('login.title')}</h3>
      </div>
      {statusMessages && (
        <div className="row">
          <ul className="list-none mb-3 mx-auto ">
            {statusMessages.map(({ message, type }, index) => (
              <li
                key={index}
                className={classNames({
                  ' text-red-800': type === 'error',
                  'text-green-800': type === 'success',
                })}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label
              htmlFor="nameInput"
              className="block mb-2 text-sm font-medium">
              {t('login.label.username')}
            </label>
          </div>
          <div className="block mb-2 text-sm font-medium">
            <input
              id="nameInput"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
            {nameError && <div className="text-red-800 ">{nameError}</div>}
          </div>
        </div>
        <div className="mt-2">
          <div>
            <label
              htmlFor="passwordInput"
              className="block mb-2 text-sm font-medium">
              {t('login.label.password')}
            </label>
          </div>
          <div className="block mb-2 text-sm font-medium">
            <input
              id="passwordInput"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
            {passwordError && (
              <div className=" text-red-800">{passwordError}</div>
            )}
          </div>
        </div>
        <div className="flex items-center mb-4">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm font-medium">
            {t('login.rememberMe')}
          </label>
        </div>

        <div className="row">
            <p className="ml-2 text-sm font-medium mb-3">
              Forgot your password? Click <a className="text-blue-800 hover:text-green-800" href= '/login/reset'>here</a>
            </p>
        </div>

        <div className="row">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            type="submit">
            {t('login.button')}
          </button>
        </div>

      </form>
      {pendingMFA && (
          <div className="max-w-sm m-auto">
            <h3 className="px-0">MFA Verification</h3>
            <form onSubmit={handleMfaSubmit}>
              <div className="row">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5 mt-2 mb-2"
              />
              </div>
              <div className="row">
              <button
                className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                type="submit">Verify</button>
                </div>
            </form>
          </div>
        )}
    </div>
  )
}

export default UserLoginForm
