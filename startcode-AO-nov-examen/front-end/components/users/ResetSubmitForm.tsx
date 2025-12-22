import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import UserService from '@services/UserService'
import { StatusMessage } from '@types'
import { useTranslation } from 'next-i18next'


type ResetSubmitFormProps = {
  token: string;
};

const ResetSubmitForm: React.FC<ResetSubmitFormProps> = ({ token }) =>{
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

      if (!password || password.trim() == ""){
          setErrors((errors) => [...errors, "Invalid password"]);
      result = false;
      }
      return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearErrors()

    if(!validate()) {
      return;
    }

    const response = await UserService.confirmReset({token, newp: password});
    const data = await response.json();

    if ( response.status !== 201 ) {
        setErrors((errors) => [...errors, data.message]);    
    } else {
        setStatusMessages([{message: "Check your email for further instructions.", type: "success"}]);
        setTimeout(()=>{
                router.push("/login");
        }, 2000);
    }
  };

  return (
    <div className="max-w-sm m-auto">
          <div>
            <h3 className="px-0">Reset password</h3>
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
        />

        <button 
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            Reset password
        </button>
      </form>
    </div>
  );
}

export default ResetSubmitForm