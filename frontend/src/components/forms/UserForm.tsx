"use client";
import { useState } from 'react';
import { Modal, FormField, FormButtons } from '../ui';
import { User, UserCreateRequest, UserUpdateRequest } from '@/lib/types/user';

type UserFormCreateProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserCreateRequest) => Promise<void>;
  isLoading?: boolean;
  mode: "create";
};

type UserFormEditProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserUpdateRequest) => Promise<void>;
  user: User;
  isLoading?: boolean;
  mode: "edit";
};

type UserFormProps = UserFormCreateProps | UserFormEditProps;

export default function UserForm(props: UserFormProps) {
  const { isOpen, onClose, onSubmit, isLoading = false } = props;
  const isEditMode = props.mode === "edit";
  const user = isEditMode ? props.user : undefined;

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<string>('');

  const handleSubmit = async () => {
    try {
      setErrors('');
      
      // Validações básicas
      if (!isEditMode && !formData.username.trim()) {
        setErrors('Nome de usuário é obrigatório');
        return;
      }
      
      if (!formData.email.trim()) {
        setErrors('Email é obrigatório');
        return;
      }

      if (!isEditMode && !formData.password) {
        setErrors('Senha é obrigatória');
        return;
      }

      if (!isEditMode && formData.password !== formData.confirmPassword) {
        setErrors('Senhas não coincidem');
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setErrors('Senha deve ter pelo menos 6 caracteres');
        return;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrors('Email inválido');
        return;
      }

      // Prepara os dados para envio
      if (isEditMode) {
        const submitData: UserUpdateRequest = {
          email: formData.email,
          name: formData.name || undefined,
          password: formData.password || undefined
        };
        await (onSubmit as (data: UserUpdateRequest) => Promise<void>)(submitData);
      } else {
        const submitData: UserCreateRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined
        };
        await (onSubmit as (data: UserCreateRequest) => Promise<void>)(submitData);
      }

      handleClose();
    } catch (error) {
      setErrors('Erro ao salvar usuário. Tente novamente.');
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: ''
    });
    setErrors('');
    onClose();
  };

  const updateFormData = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Editar Perfil' : 'Novo Usuário'}
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {errors && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors}
          </div>
        )}

        {props.mode === "create" && (
          <FormField
            label="Nome de Usuário"
            name="username"
            type="text"
            value={formData.username}
            onChange={updateFormData('username')}
            required
            placeholder="Ex: usuario123"
            disabled={isLoading}
          />
        )}

        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={updateFormData('email')}
          required
          placeholder="usuario@exemplo.com"
          disabled={isLoading}
        />

        <FormField
          label="Nome Completo"
          name="name"
          type="text"
          value={formData.name}
          onChange={updateFormData('name')}
          placeholder="Seu nome completo (opcional)"
          disabled={isLoading}
        />

        <FormField
          label={isEditMode ? "Nova Senha (opcional)" : "Senha"}
          name="password"
          type="password"
          value={formData.password}
          onChange={updateFormData('password')}
          required={!isEditMode}
          placeholder="Mínimo 6 caracteres"
          disabled={isLoading}
        />

        <FormField
          label="Confirmar Senha"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={updateFormData('confirmPassword')}
          required={!isEditMode || !!formData.password}
          placeholder="Digite a senha novamente"
          disabled={isLoading}
        />

        <FormButtons
          onCancel={handleClose}
          onSubmit={handleSubmit}
          submitLabel={isEditMode ? 'Atualizar Perfil' : 'Criar Usuário'}
          isLoading={isLoading}
          disabled={
            (props.mode === "create" && (!formData.username.trim() || !formData.email.trim() || !formData.password)) ||
            (props.mode === "edit" && !formData.email.trim()) ||
            (!!formData.password && formData.password !== formData.confirmPassword)
          }
        />
      </form>
    </Modal>
  );
}
