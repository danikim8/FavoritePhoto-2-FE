'use client';

import { useEffect } from 'react';
import { useModal } from '@/components/modal/ModalContext';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/lib/api/user-service';
import PointDrawModal from '@/components/common/PointDrawModal';

export default function AppInitializer() {
  const { user } = useAuth();
  const { openModal } = useModal();

  useEffect(() => {
    if (!user || !user.id) return;

    userService.checkPointCooldown().then((data) => {
      if (data.canDraw) {
        // 바로 뽑을 수 있으면 즉시 모달 표시
        openModal({
          type: 'point',
          key: 'point-draw',
          children: <PointDrawModal />,
        });
      } else {
        // 아직 쿨타임 남아있으면 setTimeout으로 예약
        setTimeout(() => {
          openModal({
            type: 'point',
            key: 'point-draw',
            children: <PointDrawModal />,
          });
        }, data.remainSeconds * 1000); // 쿨타임이 끝난 후 자동으로 모달 열기
      }
    });
  }, [user]);

  return null;
}
