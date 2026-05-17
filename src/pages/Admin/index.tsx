import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { settingsApi, rolesApi, usersApi, itemsApi } from '@/services/api';
import { useLoading } from '@/context/LoadingContext';
import {
  Container,
  Title,
  Tabs,
  Table,
  Button,
  Group,
  Modal,
  TextInput,
  ActionIcon,
  Paper,
  Text,
  Stack,
  Alert,
  Tooltip,
  Divider,
  Select,
  Switch,
  Pagination,
  CloseButton,
} from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconAlertCircle,
  IconLayoutGrid,
  IconBrain,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';

const cleanGemField = (str: string): string => {
  return str
    .replace(/_/g, ' ')
    .replace(/[\r\n\t\u00a0\u200b]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  // State variables
  const [activeTab, setActiveTab] = useState<string>('gems');
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Form fields
  const [nameRu, setNameRu] = useState('');
  const [nameEng, setNameEng] = useState('');
  const [optionRu, setOptionRu] = useState('');
  const [optionEng, setOptionEng] = useState('');
  const [discriminator, setDiscriminator] = useState('');

  // User form fields
  const [userLogin, setUserLogin] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userDisabled, setUserDisabled] = useState(false);
  const [blockRegistrations, setBlockRegistrations] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await settingsApi.fetchSettings();
      if (res.ok) {
        const data = await res.json();
        setBlockRegistrations(data.blockRegistrations);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleToggleRegistration = async (checked: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await settingsApi.updateSettings(checked);
      if (res.ok) {
        setBlockRegistrations(checked);
      } else {
        setErrorMsg('Не удалось сохранить настройки регистрации.');
      }
    } catch (err) {
      console.error('Failed to update registration block:', err);
      setErrorMsg('Ошибка связи с сервером.');
    }
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await rolesApi.fetchRoles();
      const data = await res.json();
      if (Array.isArray(data)) {
        setRoles(data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchSettings();
  }, []);

  // Fetch items based on active tab
  const fetchItems = async (tab: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(ROUTES.LOGIN.URL);
      return;
    }

    setItems([]);
    setLoading(true);

    try {
      // Искусственная задержка для плавного отображения спиннера
      const [response] = await Promise.all([
        tab === 'users' ? usersApi.fetchUsers() : itemsApi.fetchItems(tab),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        navigate(ROUTES.LOGIN.URL);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Не удалось загрузить данные с сервера.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  // Open modal for adding a new item
  const handleAddNew = () => {
    setSelectedItem(null);
    if (activeTab === 'users') {
      setUserLogin('');
      setUserRole('User');
      setUserPassword('');
      setUserDisabled(false);
    } else {
      setNameRu('');
      setNameEng('');
      setOptionRu('');
      setOptionEng('');
      setDiscriminator('');
    }
    setErrorMsg(null);
    setModalOpen(true);
  };

  // Open modal for editing an existing item
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    if (activeTab === 'users') {
      setUserLogin(item.login || '');
      setUserRole(item.role || '');
      setUserPassword('');
      setUserDisabled(item.disabled === 1);
    } else {
      setNameRu(item.name_ru || '');
      setNameEng(item.name_eng || '');
      setOptionRu(item.option_ru || '');
      setOptionEng(item.option_eng || '');
      setDiscriminator(item.discriminator || '');
    }
    setErrorMsg(null);
    setModalOpen(true);
  };

  // Save changes (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(ROUTES.LOGIN.URL);
      return;
    }

    const payload =
      activeTab === 'users'
        ? {
            login: userLogin.trim(),
            role: userRole,
            password: userPassword.trim(),
            disabled: userDisabled,
          }
        : {
            name_ru: cleanGemField(nameRu),
            name_eng: cleanGemField(nameEng),
            option_ru: cleanGemField(optionRu),
            option_eng: cleanGemField(optionEng),
            discriminator: discriminator,
          };

    try {
      let response;
      if (selectedItem) {
        // Update
        response = activeTab === 'users'
          ? await usersApi.updateUser(selectedItem.id, payload)
          : await itemsApi.updateItem(activeTab, selectedItem.id, payload);
      } else {
        // Create
        response = await itemsApi.createItem(activeTab, payload);
      }

      if (response.ok) {
        setModalOpen(false);
        fetchItems(activeTab);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || 'Произошла ошибка при сохранении.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ошибка соединения с сервером.');
    }
  };

  // Delete item
  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate(ROUTES.LOGIN.URL);
      return;
    }

    try {
      const response = activeTab === 'users'
        ? await usersApi.deleteUser(itemToDelete)
        : await itemsApi.deleteItem(activeTab, itemToDelete);

      if (response.ok) {
        fetchItems(activeTab);
      } else {
        setErrorMsg('Не удалось удалить запись.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ошибка при удалении.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Filter items in real time
  const filteredItems = items.filter((item) => {
    const search = searchQuery.toLowerCase();
    if (activeTab === 'users') {
      return (
        (item.login || '').toLowerCase().includes(search) ||
        (item.role || '').toLowerCase().includes(search)
      );
    }
    return (
      (item.name_ru || '').toLowerCase().includes(search) ||
      (item.name_eng || '').toLowerCase().includes(search) ||
      (item.option_ru || '').toLowerCase().includes(search) ||
      (item.option_eng || '').toLowerCase().includes(search) ||
      (item.discriminator || '').toLowerCase().includes(search)
    );
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container size="xl" py="xl">
      <Paper
        p="xl"
        radius="md"
        style={{
          background: '#1e293b',
          color: '#f1f5f9',
          borderColor: '#475569',
        }}
        withBorder
      >
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2} style={{ color: '#f59e0b' }}>
              Панель администратора
            </Title>
            <Text size="sm" style={{ color: '#cbd5e1' }}>
              Управление базой данных распознавания и цен предметов
            </Text>
          </div>
          {activeTab !== 'users' && (
            <Button
              leftSection={<IconPlus size={16} />}
              style={{ backgroundColor: '#3295ff' }}
              onClick={handleAddNew}
            >
              Добавить запись
            </Button>
          )}
        </Group>

        <Divider my="md" style={{ borderColor: '#475569' }} />

        <Group justify="space-between" mb="md">
          <Tabs
            value={activeTab}
            onChange={(value) => {
              setActiveTab(value || 'gems');
              setSearchQuery('');
            }}
            variant="pills"
            color="indigo"
          >
            <Tabs.List>
              <Tabs.Tab value="gems" leftSection={<IconTrendingUp size={16} />}>
                Лабиринт
              </Tabs.Tab>
              <Tabs.Tab
                value="heist"
                leftSection={<IconLayoutGrid size={16} />}
              >
                Кража
              </Tabs.Tab>
              <Tabs.Tab value="memory" leftSection={<IconBrain size={16} />}>
                Воспоминания
              </Tabs.Tab>
              <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                Пользователи
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
          <TextInput
            placeholder="Поиск..."
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery && (
                <CloseButton
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  variant="transparent"
                  size="sm"
                  style={{ color: '#cbd5e1' }}
                />
              )
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
              }
            }}
            style={{ width: 300 }}
            styles={{
              input: {
                background: '#0f172a',
                color: '#f1f5f9',
                border: '1px solid #475569',
              },
            }}
          />
        </Group>

        {activeTab === 'users' && (
          <Paper
            p="md"
            mb="md"
            radius="sm"
            style={{
              background: '#0f172a',
              border: '1px solid #475569',
              color: '#f1f5f9',
            }}
          >
            <Group justify="space-between">
              <div>
                <Text size="sm" style={{ fontWeight: 600, color: '#f59e0b' }}>
                  Настройки регистрации
                </Text>
                <Text size="xs" style={{ color: '#cbd5e1' }}>
                  Если эта опция включена, новые пользователи не смогут
                  зарегистрироваться в системе.
                </Text>
              </div>
              <Switch
                label="Блокировать новые регистрации"
                checked={blockRegistrations}
                onChange={(event) =>
                  handleToggleRegistration(event.currentTarget.checked)
                }
                styles={{
                  label: { color: '#f1f5f9' },
                }}
              />
            </Group>
          </Paper>
        )}

        {errorMsg && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Ошибка"
            color="red"
            mb="md"
            withCloseButton
            onClose={() => setErrorMsg(null)}
            style={{
              background: '#334155',
              color: '#f1f5f9',
              border: '1px solid #f97316',
            }}
          >
            {errorMsg}
          </Alert>
        )}

        <Paper
          radius="sm"
          style={{
            background: '#0f172a',
            overflow: 'hidden',
            borderColor: '#475569',
          }}
          withBorder
        >
          <Table
            striped
            highlightOnHover
            verticalSpacing="sm"
            style={{ color: '#f1f5f9' }}
          >
            {activeTab === 'users' ? (
              <>
                <Table.Thead style={{ background: '#334155' }}>
                  <Table.Tr>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      ID
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Логин
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Роль
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Статус
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Дата регистрации
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Последний вход
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                        textAlign: 'right',
                      }}
                    >
                      Действия
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedItems.map((item) => (
                    <Table.Tr
                      key={item.id}
                      style={{ borderBottom: '1px solid #475569' }}
                    >
                      <Table.Td>{item.id}</Table.Td>
                      <Table.Td
                        onClick={() => handleEdit(item)}
                        style={{
                          fontWeight: 600,
                          color: '#f97316',
                          cursor: 'pointer',
                        }}
                      >
                        {item.login}
                      </Table.Td>
                      <Table.Td>
                        <Text
                          size="xs"
                          px="xs"
                          py={2}
                          style={{
                            background:
                              item.role === 'Admin' ? '#b45309' : '#334155',
                            color: '#f1f5f9',
                            borderRadius: 4,
                            display: 'inline-block',
                            fontWeight: 600,
                          }}
                        >
                          {item.role}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          size="xs"
                          px="xs"
                          py={2}
                          style={{
                            background:
                              item.disabled === 1 ? '#e11d48' : '#16a34a',
                            color: '#f1f5f9',
                            borderRadius: 4,
                            display: 'inline-block',
                            fontWeight: 600,
                          }}
                        >
                          {item.disabled === 1 ? 'Отключен' : 'Активен'}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ fontSize: '13px' }}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString('ru-RU')
                          : '-'}
                      </Table.Td>
                      <Table.Td style={{ fontSize: '13px' }}>
                        {item.lastLoginAt
                          ? new Date(item.lastLoginAt).toLocaleString('ru-RU')
                          : '-'}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end">
                          <Tooltip label="Редактировать">
                            <ActionIcon
                              color="yellow"
                              variant="subtle"
                              onClick={() => handleEdit(item)}
                            >
                              <IconEdit
                                size={16}
                                style={{ color: '#f59e0b' }}
                              />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Удалить">
                            <ActionIcon
                              color="orange"
                              variant="subtle"
                              onClick={() => handleDelete(item.id)}
                            >
                              <IconTrash
                                size={16}
                                style={{ color: '#f97316' }}
                              />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <Table.Tr>
                      <Table.Td
                        colSpan={7}
                        style={{
                          textAlign: 'center',
                          color: '#cbd5e1',
                          padding: '30px 0',
                        }}
                      >
                        Пользователи не найдены
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </>
            ) : (
              <>
                <Table.Thead style={{ background: '#334155' }}>
                  <Table.Tr>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      ID
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Название (RU)
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Название (ENG)
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Опция (RU)
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Опция (ENG)
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                      }}
                    >
                      Дискриминатор
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: '#f59e0b',
                        borderBottom: '1px solid #475569',
                        textAlign: 'right',
                      }}
                    >
                      Действия
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedItems.map((item) => (
                    <Table.Tr
                      key={item.id}
                      style={{ borderBottom: '1px solid #475569' }}
                    >
                      <Table.Td>{item.id}</Table.Td>
                      <Table.Td
                        onClick={() => handleEdit(item)}
                        style={{
                          fontWeight: 600,
                          color: '#f97316',
                          cursor: 'pointer',
                        }}
                      >
                        {item.name_ru}
                      </Table.Td>
                      <Table.Td
                        onClick={() => handleEdit(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.name_eng}
                      </Table.Td>
                      <Table.Td>{item.option_ru}</Table.Td>
                      <Table.Td>{item.option_eng}</Table.Td>
                      <Table.Td>
                        <Text
                          size="xs"
                          px="xs"
                          py={2}
                          style={{
                            background: '#334155',
                            color: '#f1f5f9',
                            borderRadius: 4,
                            display: 'inline-block',
                          }}
                        >
                          {item.discriminator || '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end">
                          <Tooltip label="Редактировать">
                            <ActionIcon
                              color="yellow"
                              variant="subtle"
                              onClick={() => handleEdit(item)}
                            >
                              <IconEdit
                                size={16}
                                style={{ color: '#f59e0b' }}
                              />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Удалить">
                            <ActionIcon
                              color="orange"
                              variant="subtle"
                              onClick={() => handleDelete(item.id)}
                            >
                              <IconTrash
                                size={16}
                                style={{ color: '#f97316' }}
                              />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <Table.Tr>
                      <Table.Td
                        colSpan={7}
                        style={{
                          textAlign: 'center',
                          color: '#cbd5e1',
                          padding: '30px 0',
                        }}
                      >
                        Записей не найдено
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </>
            )}
          </Table>
        </Paper>

        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              color="indigo"
              styles={{
                control: {
                  background: '#0f172a',
                  color: '#f1f5f9',
                  border: '1px solid #475569',
                  '&:hover': {
                    background: '#1e293b',
                  },
                },
              }}
            />
          </Group>
        )}
      </Paper>

      {/* Add / Edit Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={
          activeTab === 'users'
            ? 'Редактировать профиль пользователя'
            : selectedItem
              ? 'Редактировать запись'
              : 'Добавить новую запись'
        }
        size="md"
        centered
        styles={{
          header: { background: '#1e293b', color: '#f1f5f9' },
          content: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #475569',
          },
        }}
      >
        <form onSubmit={handleSave}>
          <Stack gap="md">
            {activeTab === 'users' ? (
              <>
                <TextInput
                  label="Логин"
                  placeholder="Введите логин пользователя"
                  value={userLogin}
                  onChange={(e) => setUserLogin(e.target.value)}
                  onBlur={() => setUserLogin(userLogin.trim())}
                  required
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                  }}
                />
                <Select
                  label="Роль"
                  placeholder="Выберите роль"
                  data={roles.length > 0 ? roles : ['User', 'Admin']}
                  value={userRole}
                  onChange={(value) => setUserRole(value || 'User')}
                  required
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                    dropdown: {
                      background: '#1e293b',
                      border: '1px solid #475569',
                    },
                    option: {
                      color: '#f1f5f9',
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <TextInput
                  label="Новый пароль"
                  placeholder="Оставьте пустым, чтобы не менять"
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  onBlur={() => setUserPassword(userPassword.trim())}
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                  }}
                />
                <Switch
                  label="Отключить аккаунт"
                  checked={userDisabled}
                  onChange={(event) =>
                    setUserDisabled(event.currentTarget.checked)
                  }
                  styles={{
                    label: { color: '#f1f5f9' },
                  }}
                  mt="sm"
                />
              </>
            ) : (
              <>
                <TextInput
                  label="Название (RU)"
                  placeholder="Название (RU)"
                  value={nameRu}
                  onChange={(e) => setNameRu(e.target.value.replace(/_/g, ' '))}
                  onBlur={() => setNameRu(cleanGemField(nameRu))}
                  required
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                  }}
                />
                <TextInput
                  label="Название (ENG)"
                  placeholder="Название (ENG)"
                  value={nameEng}
                  onChange={(e) => setNameEng(e.target.value.replace(/_/g, ' '))}
                  onBlur={() => setNameEng(cleanGemField(nameEng))}
                  required
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                  }}
                />
                <TextInput
                  label="Опция (RU)"
                  placeholder="Option (RU)"
                  value={optionRu}
                  onChange={(e) => setOptionRu(e.target.value.replace(/_/g, ' '))}
                  onBlur={() => setOptionRu(cleanGemField(optionRu))}
                  required
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                  }}
                />
                <TextInput
                  label="Опция (ENG)"
                  placeholder="Option (ENG)"
                  value={optionEng}
                  onChange={(e) => setOptionEng(e.target.value.replace(/_/g, ' '))}
                  onBlur={() => setOptionEng(cleanGemField(optionEng))}
                  required
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                  }}
                />
                <Select
                  label="Дискриминатор"
                  placeholder="Выберите дискриминатор"
                  data={[
                    { value: '', label: 'пустой' },
                    { value: 'alt_x', label: 'alt_x' },
                    { value: 'alt_y', label: 'alt_y' },
                    { value: 'alt_z', label: 'alt_z' },
                  ]}
                  value={discriminator || ''}
                  onChange={(value) => setDiscriminator(value || '')}
                  styles={{
                    input: {
                      background: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #475569',
                    },
                    label: { color: '#f1f5f9' },
                    dropdown: {
                      background: '#1e293b',
                      border: '1px solid #475569',
                    },
                    option: {
                      color: '#f1f5f9',
                      backgroundColor: 'transparent',
                    },
                  }}
                />
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setModalOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" style={{ backgroundColor: '#3295ff' }}>
                Сохранить
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Deletion Confirmation Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Подтверждение удаления"
        size="sm"
        centered
        styles={{
          header: { background: '#1e293b', color: '#f1f5f9' },
          content: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #475569',
          },
        }}
      >
        <Stack gap="md">
          <Text size="sm">
            Вы действительно хотите удалить эту запись? Это действие нельзя
            отменить.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setDeleteModalOpen(false)}
            >
              Отмена
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default AdminPage;
