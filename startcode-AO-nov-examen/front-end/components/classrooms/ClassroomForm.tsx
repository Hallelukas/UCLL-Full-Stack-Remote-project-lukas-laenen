import { useState } from "react";
import { useTranslation } from "next-i18next";
import ClassroomService from "@services/ClassroomService";

const ClassroomForm = () => {
    const {t} = useTranslation();

    const [name, setName] = useState<string>('');
    const [error, setError] = useState<string>();
    const [status, setStatus] = useState<string>('');

    const validate = async () => { 
        let result = true;

        if (!name) {
            setError(t('form.validate.name'));
            result = false;
        } else {
            const response = await ClassroomService.getClassroomByName(name);
            const existing = await response.json();
        
            if (existing) {
                setError(t('form.validate.exist'));
                result = false;
            }
        }
        
        return result;
    }

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        setError(null);
        setStatus(null);
        const isValid = await validate();
        if (!isValid) {
            return;
        } else {
            const response = await ClassroomService.addClassroom(name);
            const newClassroom = await response.json();
            if ( response.ok ){
                setStatus(t('form.succes') + ` ${newClassroom.name} `+ t('form.and')+ ` ${newClassroom.id}`);
                setName('');
            } else {
                setError(response.statusText);
            }
        }
    }

    return ( 
        <form onSubmit={handleSubmit}>
            <div>
                {error && (
                    <p className="text-red-800" role="alert">
                    {error}
                  </p>
                )}
                {status && (
                    <p className="text-green-800" role="alert">
                        {status}
                    </p>
                )}
            </div>
            <div className="mb-3">
                <label className="block mb-2 text-sm font-medium"><strong>{t('form.name')}:</strong></label>
                <div className="">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue:500 block w-full p-2.5"
                    />
                </div>
            </div>
            <button
                type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                {t('form.add')}
            </button>
        </form>
    );  

};

export default ClassroomForm;