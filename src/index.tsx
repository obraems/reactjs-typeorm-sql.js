import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import {initDatabase} from "./app-data-source";
import {User} from "./entity/User";

import './scss-config.scss';


initDatabase().then(async (AppDataSource)=>{

    const user = new User()
    await AppDataSource.getRepository(User).save(user)

    console.log(await AppDataSource.getRepository(User).find());

    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
    );
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
})

