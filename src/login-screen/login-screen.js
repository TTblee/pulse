import React, { useState } from 'react';
import axios from 'axios';

const LoginScreen = () => {
    const [textValue, setTextValue] = useState('');
    // TODO: do something if password is wrong
    const onTextChange = (event) => {
        setTextValue(event.target.value);
    };
    const formSubmit = (event) => {
        event.preventDefault();
        axios({
            method: 'post',
            url: '/send-survey',
            data: {
                password: textValue,
            },
        });
    };
    return (
        <div>
            <form onSubmit={formSubmit}>
                Password:
                <input type="text" onChange={onTextChange} value={textValue} />
                <button type="submit">Send Survey</button>
            </form>
        </div>
    );
};

export default LoginScreen;
