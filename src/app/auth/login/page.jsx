'use client';

import Link from 'next/link';
import Button from '@/components/common/Button';
import Image from 'next/image';
import GoogleButton from '@/components/common/GoogleButton';
import {AuthInput} from '@/components/ui/input';
import {useModal} from '@/components/modal/ModalContext';
import {useAuth} from '@/providers/AuthProvider';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {LoginSchema} from '@/schemas/login.schema';

// 테스트용 시드 계정 (비밀번호는 시드에서 모두 '1234')
const SEED_ACCOUNTS = [
  {label: '슬퍼비비', email: 'user1@example.com'},
  {label: '6시내고양이', email: 'user10@example.com'},
  {label: '휴지필름', email: 'user11@example.com'},
  {label: '이공계는팝핀', email: 'user12@example.com'},
];
const SEED_PASSWORD = '1234';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
  });

  const {openModal} = useModal();
  const {login} = useAuth();
  const router = useRouter();

  const doLogin = async data => {
    try {
      const success = await login(data);
      if (success) {
        router.push('/market');
      } else {
        throw new Error('로그인 실패');
      }
    } catch (error) {
      openModal({
        type: 'alert',
        title: '로그인 실패',
        description:
          error?.message ||
          '로그인 중 오류가 발생했습니다.\n다시 시도해주세요.',
        button: {label: '확인'},
      });
    }
  };

  const onSubmit = data => doLogin(data);

  const handleQuickLogin = email =>
    doLogin({email, password: SEED_PASSWORD});

  const handleGoogleLogin = () => {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    window.location.href = `${baseURL}/auth/google`;
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-[345px] tablet:max-w-[440px] pc:max-w-[520px]">
        {/* 로고 */}
        <div className="flex justify-center mb-20">
          <Link href={'/'}>
            <figure className="relative w-[189px] h-[35px] tablet:w-[331px] tablet:h-[60px]">
              <Image
                src={'/logo.svg'}
                fill
                className="object-cover fill"
                alt="로고"
              />
            </figure>
          </Link>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-8 w-full">
            <AuthInput
              label="이메일"
              name="email"
              type="email"
              placeholder="이메일을 입력해 주세요"
              {...register('email')}
              error={errors.email?.message}
            />

            <AuthInput
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            role="default"
            variant="primary"
            fullWidth={true}
            className="mt-11 mb-4"
          >
            로그인
          </Button>

          <GoogleButton onClick={handleGoogleLogin} />
        </form>

        {/* 테스트용 시드 계정 원클릭 로그인 */}
        <div className="mt-8">
          <p className="text-gray400 text-[12px] mb-3 text-center">
            테스트 계정 (비번 1234)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SEED_ACCOUNTS.map(account => (
              <button
                key={account.email}
                type="button"
                onClick={() => handleQuickLogin(account.email)}
                className="border border-gray400 text-gray200 text-[13px] rounded-xs py-2 hover:bg-gray500 transition-colors"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div className="mt-11 text-center text-[14px] font-[400] pc:text-[16px]">
          <span className="text-white mr-3">최애의 포토가 처음이신가요?</span>
          <Link
            href="/auth/signup"
            className="text-main underline hover:opacity-80"
          >
            회원가입하기
          </Link>
        </div>
      </div>
    </main>
  );
}
