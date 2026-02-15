// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true); // пока предполагаем, что токен есть

  useEffect(() => {
    if (!token) {
      setError('Ссылка для сброса пароля недействительна или устарела');
      setIsTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/user/reset-password', {
        token,
        newPassword: password,
      });

      setMessage('Пароль успешно изменён! Сейчас вы будете перенаправлены на страницу входа.');
      
      // Через 2 секунды перенаправляем на логин
      setTimeout(() => {
        navigate('/auth');
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при сбросе пароля';
      setError(msg);

      // Если токен просрочен или неверный — можно сразу показать предупреждение
      if (msg.includes('Недействительный') || msg.includes('просрочен')) {
        setIsTokenValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <h2>Ошибка</h2>
          <p className="error-message">{error || 'Недействительная или просроченная ссылка'}</p>
          <button
            className="submit-btn"
            onClick={() => navigate('/forgot-password')}
          >
            Запросить новый сброс пароля
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="title">Создание нового пароля</h2>
        <p className="subtitle">
          Придумайте новый надёжный пароль
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Новый пароль</label>
            <input
              type="password"
              placeholder="Минимум 8 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>Повторите пароль</label>
            <input
              type="password"
              placeholder="Повторите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !token}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
          </button>
        </form>

        <p className="back-link">
          <button className="link-button" onClick={() => navigate('/auth')}>
            ← Вернуться ко входу
          </button>
        </p>
      </div>
    </div>
  );
}