import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterForm.css';

const RegisterForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        firstName,
        lastName,
        email,
        password,
        // phone: '' // если захочешь добавить поле
      });

      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка регистрации';
      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="title">Регистрация</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя</label>
            <input
              type="text"
              placeholder="Как к вам обращаться"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value.trim())}
              required
            />
          </div>

          <div className="form-group">
            <label>Фамилия</label>
            <input
              type="text"
              placeholder="Что мы будем видеть в обращениях, помимо имени"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.trim())}
              required
            />
          </div>

          <div className="form-group">
            <label>Электронная почта</label>
            <input
              type="email"
              placeholder="Куда пришлём ответ и выборку"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="8+ символов, с заглавными буквами и цифрами"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Повтор пароля</label>
            <input
              type="password"
              placeholder="Проверяем вас"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn"><p>ЗАРЕГИСТРИРОВАТЬСЯ</p></button>
        </form>

        <p className="switch-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;