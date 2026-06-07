'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import Button from './Button';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {userService} from '../../lib/api/user-service';
import {useAuth} from '@/providers/AuthProvider';
import {useModal} from '@/components/modal/ModalContext';

export default function PointDrawModal() {
  const {openModal} = useModal();
  const [selectedBox, setSelectedBox] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const queryClient = useQueryClient();
  const {user} = useAuth();

  // 쿨타임 조회
  const {data: cooldownData, refetch: refetchCooldown} = useQuery({
    queryKey: ['pointCooldown'],
    queryFn: userService.checkPointCooldown,
  });

  // 뽑기 요청
  const {
    mutate,
    data: drawResult,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: userService.drawPoint,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['pointCooldown']}); // 캐시 무효화
      setSelectedBox(null); //여기서 박스 선택 상태 초기화
      // 다음 기회 자동 모달 예약
      setTimeout(() => {
        openModal({
          type: 'point',
          key: 'point-draw',
          children: <PointDrawModal />,
        });
      }, 3600 * 1000); //1시간 후 모달 재오픈
    },
  });

  // 타이머 설정
  useEffect(() => {
    if (!cooldownData) return;

    setRemainingTime(cooldownData.remainSeconds); // 서버로부터 초기 남은 시간 설정

    const intervalId = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalId); // 0초 되면 타이머 종료
          return 0;
        }
        return Math.max(prev - 1, 0); // 1초씩 감소, 안전하게 음수 방지
      });
    }, 1000);
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 정리
  }, [cooldownData]);

  // [2] 남은 시간 0초 되면 자동 refetch
  useEffect(() => {
    if (remainingTime === 0) {
      refetchCooldown(); // 남은 시간이 0이 되었을 때 cooldownData.canDraw도 즉시 반영
    }
  }, [remainingTime]);

  if (!cooldownData || remainingTime === null) return null;

  const handleDraw = () => {
    if (!cooldownData.canDraw || isPending || isSuccess) return;
    mutate();
  };

  const isDrawn = isSuccess;
  const point = drawResult?.point;

  return (
    <>
      <div className="w-full px-4 pb-8 text-center font-noto">
        {/* 제목 */}
        <h2 className="text-[30px] font-baskin font-[400] text-white mb-7">
          랜덤<span className="text-main">포인트</span>
        </h2>
        {!isDrawn ? (
          <>
            {/* 설명 */}
            <p className="text-white text-[16px] font-bold whitespace-pre-wrap mb-7">
              1시간마다 돌아오는 기회!
              <br />
              랜덤 상자 뽑기를 통해 포인트를 획득하세요!
            </p>

            {/* 쿨타임 (가짜 값) */}
            <p className="text-gray300 text-[14px] font-[400] mb-15 whitespace-pre-wrap">
              다음 기회까지 남은 시간 <br />
              <span className="text-main">
                {cooldownData.canDraw
                  ? '지금 뽑을 수 있어요!'
                  : `${Math.floor(remainingTime / 60)}분 ${
                      remainingTime % 60
                    }초`}
              </span>
            </p>

            {/* 상자 3개 */}
            <div className="flex justify-center gap-6 mb-4">
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    if (!isDrawn) setSelectedBox(num);
                  }}
                >
                  <div
                    className={`w-[98px] h-[76px] relative transition-opacity duration-200 ${
                      selectedBox === null || selectedBox === num
                        ? 'opacity-100'
                        : 'opacity-40'
                    }`}
                  >
                    <Image
                      src={`/images/box${num}.png`}
                      alt={`랜덤박스-${num}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 98px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </button>
              ))}
            </div>
            {/* 선택 시에만 나타나는 버튼 */}
            {selectedBox !== null && cooldownData.canDraw && !isDrawn && (
              <div className="mt-15">
                <Button
                  role="random"
                  onClick={handleDraw}
                  disabled={isPending || isDrawn} //중복 클릭 방지
                >
                  선택완료
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="w-[240px] h-[229px] relative">
                <Image
                  src="/images/point-lg.png"
                  alt="포인트 그림"
                  fill
                  sizes="(max-width: 768px) 100vw, 240px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-[24px] text-main font-bold mb-7">
              {point}P <span className="text-white">획득!</span>
            </p>

            {/* 뽑기 이후 쿨타임 표시 */}
            <p className="text-gray300 text-[14px] font-[400] mb-15 whitespace-pre-wrap">
              다음 기회까지 남은 시간 <br />
              <span className="text-main">
                {remainingTime > 0
                  ? `${Math.floor(remainingTime / 60)}분 ${
                      remainingTime % 60
                    }초`
                  : '지금 뽑을 수 있어요!'}
              </span>
            </p>
          </>
        )}
      </div>
    </>
  );
}
