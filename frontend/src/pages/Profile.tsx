import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserIcon, PencilIcon, KeyIcon } from '@heroicons/react/24/outline';

const profileSchema = yup.object({
  first_name: yup.string().required('الاسم الأول مطلوب'),
  last_name: yup.string().required('الاسم الأخير مطلوب'),
  email: yup.string().email('البريد الإلكتروني غير صحيح').required('البريد الإلكتروني مطلوب'),
}).required();

const passwordSchema = yup.object({
  current_password: yup.string().required('كلمة المرور الحالية مطلوبة'),
  new_password: yup.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').required('كلمة المرور الجديدة مطلوبة'),
  confirm_password: yup.string().oneOf([yup.ref('new_password')], 'كلمة المرور غير متطابقة').required('تأكيد كلمة المرور مطلوب'),
}).required();

type ProfileFormData = yup.InferType<typeof profileSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema)
  });

  const handleUpdateProfile = async (data: ProfileFormData) => {
    setProfileError('');
    setProfileSuccess('');
    try {
      // Here you would typically call an API to update the user profile
      // For now, we'll just update the local state
      updateUser(data);
      setProfileSuccess('تم تحديث الملف الشخصي بنجاح');
      setIsEditingProfile(false);
    } catch (error: any) {
      setProfileError(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    }
  };

  const handleChangePassword = async (data: PasswordFormData) => {
    setPasswordError('');
    setPasswordSuccess('');
    try {
      // Here you would typically call an API to change the password
      // For now, we'll just show a success message
      setPasswordSuccess('تم تغيير كلمة المرور بنجاح');
      setIsChangingPassword(false);
      resetPassword();
    } catch (error: any) {
      setPasswordError(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileError('');
    setProfileSuccess('');
    resetProfile({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    });
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordError('');
    setPasswordSuccess('');
    resetPassword();
  };

  if (!user) {
    return <div className="text-center text-gray-500 py-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <UserIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">المعلومات الشخصية</h2>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            تعديل
          </button>
        </div>

        {!isEditingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
                <p className="text-gray-900">{user.first_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأخير</label>
                <p className="text-gray-900">{user.last_name}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
              <p className="text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانضمام</label>
              <p className="text-gray-900">{new Date(user.date_joined).toLocaleDateString('ar-SA')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحساب</label>
              <p className="text-gray-900">{user.is_staff ? 'مدير النظام' : 'مستخدم عادي'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitProfile(handleUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
                <input
                  {...registerProfile('first_name')}
                  type="text"
                  className="input-field"
                />
                {profileErrors.first_name && (
                  <p className="text-red-600 text-sm mt-1">{profileErrors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأخير</label>
                <input
                  {...registerProfile('last_name')}
                  type="text"
                  className="input-field"
                />
                {profileErrors.last_name && (
                  <p className="text-red-600 text-sm mt-1">{profileErrors.last_name.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                {...registerProfile('email')}
                type="email"
                className="input-field"
              />
              {profileErrors.email && (
                <p className="text-red-600 text-sm mt-1">{profileErrors.email.message}</p>
              )}
            </div>
            
            {profileError && (
              <div className="text-red-600 text-sm">{profileError}</div>
            )}
            {profileSuccess && (
              <div className="text-green-600 text-sm">{profileSuccess}</div>
            )}
            
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={cancelProfileEdit}>
                إلغاء
              </button>
              <button type="submit" className="btn-primary">
                حفظ التغييرات
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            تغيير كلمة المرور
          </h2>
          <button
            onClick={() => setIsChangingPassword(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <KeyIcon className="h-4 w-4" />
            تغيير
          </button>
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleSubmitPassword(handleChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
              <input
                {...registerPassword('current_password')}
                type="password"
                className="input-field"
              />
              {passwordErrors.current_password && (
                <p className="text-red-600 text-sm mt-1">{passwordErrors.current_password.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
              <input
                {...registerPassword('new_password')}
                type="password"
                className="input-field"
              />
              {passwordErrors.new_password && (
                <p className="text-red-600 text-sm mt-1">{passwordErrors.new_password.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
              <input
                {...registerPassword('confirm_password')}
                type="password"
                className="input-field"
              />
              {passwordErrors.confirm_password && (
                <p className="text-red-600 text-sm mt-1">{passwordErrors.confirm_password.message}</p>
              )}
            </div>
            
            {passwordError && (
              <div className="text-red-600 text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-green-600 text-sm">{passwordSuccess}</div>
            )}
            
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={cancelPasswordChange}>
                إلغاء
              </button>
              <button type="submit" className="btn-primary">
                تغيير كلمة المرور
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">اضغط على "تغيير" لتحديث كلمة المرور الخاصة بك</p>
        )}
      </div>

      {/* Account Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">إحصائيات الحساب</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-blue-600">المشاريع المنشأة</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-green-600">المهام المكتملة</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-yellow-600">المهام المتابعة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 