import React, { useEffect, useState } from 'react';
import style from './App.scss';
import { AppDataSource } from './app-data-source';
import User from './entity/User';
import { generateRandomUser } from './utils';

function App() {
  const [users, setUsers] = useState(null);

  function loadList() {
    AppDataSource.getRepository(User).find().then((res) => {
      setUsers(res);
    });
  }

  useEffect(() => {
    loadList();
  }, []);

  if (users === null) {
    return null;
  }

  const removeUser = (user:User) => {
    user.remove().then(() => {
      loadList();
    });
  };

  const addUser = () => {
    const user = generateRandomUser();
    user.save().then(() => {
      loadList();
    });
  };

  return (
    <div className={style.container}>
      <h1>User Lists</h1>
      <ul>
        {users.map((user: User) => (
          <li
            key={user.id}
            className={style.userInfo}
          >
            <div style={{ flex: 1 }}>
              {user.id}
              {' '}
              -
              {user.name}
              {' '}
              -
              {user.email}
            </div>
            <div className={style.buttonContainer}>
              <button
                type="button"
                onClick={() => removeUser(user)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={addUser}
        className={style.addButton}
      >
        Add User
      </button>
    </div>
  );
}

export default App;
