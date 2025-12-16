import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import UserService from '@services/UserService'
import { StatusMessage } from '@types'
import { useTranslation } from 'next-i18next'

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter()

  const [errors, setErrors] = useState<string[]>([]);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([])

  const { t } = useTranslation()

  const clearErrors = () => {
    setErrors([])
    setStatusMessages([])
  }

  const validate = (): boolean => {
        let result = true;

        if (!username || username.trim() == ""){
            setErrors((errors) => [...errors, "Invalid username"]);
            result = false;
        }

        if (!firstname || firstname.trim() == ""){
            setErrors((errors) => [...errors, "Invalid first name"]);
            result = false;
        }

        if (!lastname || lastname.trim() == ""){
            setErrors((errors) => [...errors, "Invalid last name"]);
            result = false;
        }

        if (!email || email.trim() == ""){
            setErrors((errors) => [...errors, "Invalid email"]);
            result = false;
        }        

        if (!password || password.trim() == ""){
            setErrors((errors) => [...errors, "Invalid password"]);
            result = false;
        }

        return result;
    };

  const handleSubmit = async (event) => {
    event.preventDefault()

    clearErrors()

    if(!validate()) {
      return;
    }

    const user = { 
      username, 
      firstName: firstname,
      lastName: lastname,
      email,
      password,
      role: 'student' as 'student'
    }
    const response = await UserService.registerUser(user);
    const data = await response.json();

    if ( response.status !== 200 ) {
        setErrors((errors) => [...errors, data.message]);    
    } else {
        setStatusMessages([{message: "You are registered and can now login.", type: "success"}]);
        setTimeout(()=>{
                router.push("/login");
        }, 2000);
    }
  };

  return (
    <div className="max-w-sm m-auto">
      <div>
        <h3 className="px-0">{t('login.title')}</h3>
      </div>
      <div className="m-3">
                {errors.length > 0 && (
                        <ul className="text-red-800 rounded-lg" role="alert">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                )}
                {statusMessages && (
                        <ul>
                            {statusMessages.map(({message, type}, index ) => (
                                <li
                                    key={index}
                                    className={classNames({
                                        "text-red-800": type === "error",
                                        "text-green-800": type === "success",
                                    })}>
                                    {message}
                                </li>
                            ))}
                        </ul>

                )}
            </div>
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
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="mt-2">
          <div>
            <label
              htmlFor="firstnameInput"
              className="block mb-2 text-sm font-medium">
              {t('register.firstname')}
            </label>
          </div>
          <div className="block mb-2 text-sm font-medium">
            <input
              id="firstnameInput"
              type="text"
              value={firstname}
              onChange={(event) => setFirstName(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="mt-2">
          <div>
            <label
              htmlFor="lastnameinput"
              className="block mb-2 text-sm font-medium">
              {t('register.lastname')}
            </label>
          </div>
          <div className="block mb-2 text-sm font-medium">
            <input
              id="lastnameinput"
              type="text"
              value={lastname}
              onChange={(event) => setLastName(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="mt-2">
          <div>
            <label
              htmlFor="emailinput"
              className="block mb-2 text-sm font-medium">
              {t('register.email')}
            </label>
          </div>
          <div className="block mb-2 text-sm font-medium">
            <input
              id="emailinput"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
            />
          </div>
        </div>

        <div className="mt-2">
          <div>
            <label
              htmlFor="passwordInput"
              className="block mb-2 text-sm font-medium">
              {t('register.password')}
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
          </div>
        </div>

        <div className="row">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            type="submit">
            {t('header.nav.register')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterForm
