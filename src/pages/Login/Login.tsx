import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import { authApi } from '@/services/api';
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Center,
  ThemeIcon,
} from '@mantine/core';
import {
  IconLock,
  IconUser,
  IconAlertCircle,
  IconShieldLock,
} from '@tabler/icons-react';
import './Login.style.scss';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = isRegister
        ? await authApi.register(login, password)
        : await authApi.login(login, password);

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if ((data.role || '').toLowerCase() === 'admin') {
          navigate(ROUTES.ADMIN.URL);
        } else {
          navigate(ROUTES.LAB.URL);
        }
      } else {
        setError(
          data.error ||
            (isRegister
              ? 'Не удалось зарегистрироваться'
              : 'Неверный логин или пароль'),
        );
      }
    } catch (err) {
      setError('Не удалось подключиться к серверу');
    }
  };

  return (
    <Container size="xs" py="xl" className="login-container">
      <Center mb="lg">
        <ThemeIcon
          size={56}
          radius="xl"
          color="indigo"
          variant="light"
          style={{ border: '1px solid var(--mantine-color-indigo-4)' }}
        >
          <IconShieldLock size={32} />
        </ThemeIcon>
      </Center>

      <Title order={2} ta="center" mb={6} className="login-title">
        {isRegister ? 'Регистрация' : 'Вход в систему'}
      </Title>

      <Text c="dimmed" size="sm" ta="center" mb="xl">
        {isRegister ? 'Создайте аккаунт PoE OCR' : 'Личный кабинет PoE OCR'}
      </Text>

      <Paper p="xl" radius="md" withBorder className="login-paper">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Логин"
              placeholder="Введите ваш логин"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              leftSection={<IconUser size={16} />}
              autoComplete="username"
              id="login"
              name="username"
            />

            <PasswordInput
              label="Пароль"
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftSection={<IconLock size={16} />}
              autoComplete="current-password"
              id="password"
              name="password"
            />

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Ошибка"
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              mt="md"
              size="md"
              color="indigo"
              className="login-btn"
            >
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </Button>

            <Center mt="md">
              <Text
                size="sm"
                c="indigo"
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
              >
                {isRegister
                  ? 'Уже есть аккаунт? Войти'
                  : 'Нет аккаунта? Зарегистрироваться'}
              </Text>
            </Center>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
