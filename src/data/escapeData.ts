export interface AvatarOption {
  id: string;
  name: string;
  chineseName: string;
  pinyin: string;
  emoji: string;
  roleTitle: string;
  color: string;
  bgGradient: string;
  desc: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'panda',
    name: '자이언트 판다 대원',
    chineseName: '大熊猫 (dàxióngmāo)',
    pinyin: 'Dàxióngmāo',
    emoji: '🐼',
    roleTitle: '쓰촨성 국보 탐정',
    color: '#10b981',
    bgGradient: 'from-emerald-500/20 to-teal-600/20 border-emerald-400/50',
    desc: '중국의 국보! 대나무 숲의 단서를 가장 잘 찾는 구출 대장입니다.',
  },
  {
    id: 'monkey',
    name: '황금 원숭이 대원',
    chineseName: '金丝猴 (jīnsīhóu)',
    pinyin: 'Jīnsīhóu',
    emoji: '🐵',
    roleTitle: '손오공 암호 해독가',
    color: '#f59e0b',
    bgGradient: 'from-amber-500/20 to-orange-600/20 border-amber-400/50',
    desc: '서유기 손오공의 모델! 재빠른 두뇌로 성조와 병음 암호를 풉니다.',
  },
  {
    id: 'dolphin',
    name: '양쯔강 돌고래 대원',
    chineseName: '白暨豚 (báijìtún)',
    pinyin: 'Báijìtún',
    emoji: '🐬',
    roleTitle: '창장강 음파 통신원',
    color: '#06b6d4',
    bgGradient: 'from-cyan-500/20 to-sky-600/20 border-cyan-400/50',
    desc: '하얀 여신이라 불리는 물속의 판다! 소리 단서를 정확히 잡아냅니다.',
  },
  {
    id: 'tiger',
    name: '호랑이 사부 대원',
    chineseName: '老虎师傅 (lǎohǔ shīfu)',
    pinyin: 'Lǎohǔ Shīfu',
    emoji: '🐯',
    roleTitle: '무술 예절 수호자',
    color: '#f43f5e',
    bgGradient: 'from-rose-500/20 to-red-600/20 border-rose-400/50',
    desc: '전통 인사법 포권(抱拳)과 공수(拱手)의 달인! 잠긴 문을 여는 힘캐입니다.',
  },
  {
    id: 'rabbit',
    name: '옥토끼 연구원',
    chineseName: '玉兔学生 (yùtù xuésheng)',
    pinyin: 'Yùtù Xuésheng',
    emoji: '🐰',
    roleTitle: '홍바오 보물 기록원',
    color: '#a855f7',
    bgGradient: 'from-purple-500/20 to-indigo-600/20 border-purple-400/50',
    desc: '꼼꼼한 기록으로 5개 방의 비밀 숫자를 모아 탈출구를 여는 엘리트입니다.',
  },
];

export interface InventoryItem {
  id: string;
  puzzleId: string;
  stageNum: number;
  name: string;
  icon: string;
  category: 'key' | 'note' | 'card' | 'tool';
  shortDesc: string;
  detailNote: string;
  combinesWithId?: string;
  combinedResult?: {
    id: string;
    name: string;
    icon: string;
    shortDesc: string;
    detailNote: string;
  };
}

export interface PuzzleHotspot {
  id: string;
  stageNum: number;
  title: string;
  objectName: string;
  inspectVisualDesc: string;
  iconEmoji: string;
  xPercent: number; // hotspot center X (%)
  yPercent: number; // hotspot center Y (%)
  widthPercent: number; // hotspot width (%)
  heightPercent: number; // hotspot height (%)
  isStageFinal: boolean;
  requiredItemId?: string; // Item that MUST be selected in inventory to unlock this hotspot
  requiredItemName?: string;
  lockedHintMessage?: string;
  lessonRef: string;
  storyContext: string;
  clueNoteTitle: string;
  clueNoteContent: string;
  pronunciationText: string;
  question: string;
  options: {
    id: string;
    label: string;
    subLabel?: string;
  }[];
  correctOptionId: string;
  rewardDigit: string;
  rewardItemName: string;
  rewardItem: InventoryItem;
  successExplanation: string;
}

export interface RoomStageInfo {
  stageNum: number;
  name: string;
  chineseTitle: string;
  pinyinTitle: string;
  lessonBadge: string;
  themeColor: string;
  mapCoords: { x: number; y: number };
  roomSubtitle: string;
  storyIntro: string;
  missionGoal: string;
  bgThemeClass: string;
  darknessDefault: boolean;
  puzzles: PuzzleHotspot[];
}

export const ESCAPE_STAGES: RoomStageInfo[] = [
  {
    stageNum: 1,
    name: '제1방: 연구소 보안 로비',
    chineseTitle: '1. 你好! (만남과 헤어짐)',
    pinyinTitle: 'Nǐ hǎo! & Zàijiàn!',
    lessonBadge: '1과 · 만남과 인사 (교과서 26~27쪽)',
    themeColor: '#10b981',
    mapCoords: { x: 14, y: 72 },
    roomSubtitle: '정전된 쓰촨성 판다 연구소 입구 · 손전등으로 오브젝트를 비춰 조사하세요!',
    storyIntro:
      '비상벨이 울리며 연구소 로비가 어두워졌습니다! 손전등 불빛으로 로비의 [안내 데스크 마이크], [잠긴 보안 서랍], [출구 퇴근 기록계]를 찾아 조사하세요. 인벤토리에서 열쇠나 카드를 클릭해 활성화한 뒤 잠긴 곳을 클릭하면 열립니다!',
    missionGoal: '① 데스크 마이크 조사(황동 열쇠 획득) → ② 열쇠를 장착해 잠긴 서랍 열기(출입 카드 획득) → ③ 카드를 장착해 로비 출구 도어락 해제!',
    bgThemeClass: 'from-emerald-950 via-slate-900 to-teal-950',
    darknessDefault: true,
    puzzles: [
      {
        id: 'r1_p1',
        stageNum: 1,
        title: '안내 데스크 음성 인식 마이크',
        objectName: '초록빛 데스크 마이크',
        inspectVisualDesc: '안내 데스크 위에 놓인 구형 음성 인식 마이크입니다. 받침대 아래에 작은 황동 열쇠가 걸려 있습니다.',
        iconEmoji: '🎙️',
        xPercent: 23,
        yPercent: 58,
        widthPercent: 18,
        heightPercent: 26,
        isStageFinal: false,
        lessonRef: '제1과 본문1 (교과서 26쪽)',
        storyContext:
          '안내 데스크 마이크에 불이 깜빡입니다. 등굣길에 친구 왕징징을 만났을 때 가장 먼저 건네는 반가운 인사말을 말해야 받침대의 [서랍 황동 열쇠]가 분리됩니다!',
        clueNoteTitle: '📘 교과서 26쪽 핵심 단서 노트',
        clueNoteContent:
          '• nǐ (你): 너, 당신 / hǎo (好): 안녕하다, 좋다\n• 만났을 때 기본 인사: "Nǐ hǎo! (你好! - 안녕!)"\n• 제3성(ˇ) 뒤에 제3성(ˇ)이 오면 앞의 제3성을 제2성(ˊ)처럼 올려 발음하지만 표기는 그대로 Nǐ hǎo로 써요!',
        pronunciationText: '你好！',
        question: '친구를 만났을 때 "안녕!" 하고 인사하는 중국어 표현으로 알맞은 것은?',
        // 정답을 2번(id: 'c_nihao')에 배치
        options: [
          { id: 'w1', label: 'Zàijiàn! (再见!)', subLabel: '잘 가! 또 만나!' },
          { id: 'c_nihao', label: 'Nǐ hǎo! (你好!)', subLabel: '너 + 안녕하다 (만남 인사)' },
          { id: 'w2', label: 'Duìbuqǐ. (对不起。)', subLabel: '미안합니다.' },
          { id: 'w3', label: 'Bú kèqi! (不客气!)', subLabel: '천만에요!' },
        ],
        correctOptionId: 'c_nihao',
        rewardDigit: '3',
        rewardItemName: '🔑 보안 데스크 황동 열쇠 + 마스터 숫자 [3]',
        rewardItem: {
          id: 'item_r1_drawer_key',
          puzzleId: 'r1_p1',
          stageNum: 1,
          name: '보안 서랍 황동 열쇠',
          icon: '🔑',
          category: 'key',
          shortDesc: '로비 중앙의 [잠긴 보안 서랍]을 열 수 있는 열쇠',
          detailNote: '마이크 받침대에서 획득한 황동 열쇠입니다. 손잡이에 제3성 성조 변화 힌트 숫자 [3]이 각인되어 있습니다. 인벤토리에서 이 열쇠를 클릭해 활성화(선택)한 뒤 방 안의 [잠긴 보안 서랍]을 클릭하세요!',
        },
        successExplanation:
          '정답입니다! "Nǐ hǎo! (你好!)"는 만났을 때 건네는 인사예요. 인벤토리에 [🔑 보안 서랍 황동 열쇠]와 마스터 숫자 [3]이 들어왔습니다! 이제 아래 인벤토리에서 열쇠를 클릭해 장착한 뒤 [잠긴 보안 서랍]을 열어 보세요!',
      },
      {
        id: 'r1_p2',
        stageNum: 1,
        title: '잠긴 보안 데스크 서랍 (선생님 출입증 보관함)',
        objectName: '잠긴 보안 서랍',
        inspectVisualDesc: '선생님 전용 마스터 출입 카드가 들어 있는 철제 서랍입니다. 낡은 열쇠구멍이 보입니다.',
        iconEmoji: '🗄️',
        xPercent: 52,
        yPercent: 64,
        widthPercent: 20,
        heightPercent: 26,
        isStageFinal: false,
        requiredItemId: 'item_r1_drawer_key',
        requiredItemName: '🔑 보안 서랍 황동 열쇠',
        lockedHintMessage:
          '🔒 서랍이 굳게 잠겨 있습니다! 먼저 왼쪽 [초록빛 데스크 마이크]를 조사해 [🔑 보안 서랍 황동 열쇠]를 얻은 뒤, 화면 하단 인벤토리에서 열쇠를 클릭(장착)한 상태로 이 서랍을 클릭하세요!',
        lessonRef: '제1과 표현1 (교과서 27쪽)',
        storyContext:
          '황동 열쇠로 서랍을 열자 안에 디지털 출입증 케이스가 있습니다! 화면에 "선생님을 부르는 중국어 호칭을 입력하면 출입증이 발급됩니다"라고 적혀 있습니다.',
        clueNoteTitle: '📘 교과서 27쪽 핵심 단서 노트',
        clueNoteContent:
          '• nǐ (你: 너) → nǐmen (你们: 너희들) : 인칭대명사 뒤에 men(们)을 붙이면 복수(~들)가 됩니다!\n• nín (您: 당신 - 존칭), lǎoshī (老师: 선생님), dàjiā (大家: 여러분)\n• 선생님께 인사할 때: "Lǎoshī hǎo! (老师好! - 선생님 안녕하세요!)"',
        pronunciationText: '老师好！你们好！',
        question: '선생님께 "선생님 안녕하세요!"라고 인사할 때 빈칸에 들어갈 말은? [ (      ) hǎo! ]',
        // 정답을 4번(id: 'c_laoshi')에 배치
        options: [
          { id: 'w1', label: 'Míngtiān (明天)', subLabel: '내일' },
          { id: 'w2', label: 'Guānxi (关系)', subLabel: '관계' },
          { id: 'w3', label: 'Màozi (帽子)', subLabel: '모자' },
          { id: 'c_laoshi', label: 'Lǎoshī (老师)', subLabel: '선생님 (Lǎoshī hǎo!)' },
        ],
        correctOptionId: 'c_laoshi',
        rewardDigit: '',
        rewardItemName: '🪪 선생님 마스터 출입 카드',
        rewardItem: {
          id: 'item_r1_id_card',
          puzzleId: 'r1_p2',
          stageNum: 1,
          name: '선생님 마스터 출입 카드',
          icon: '🪪',
          category: 'card',
          shortDesc: '로비 오른쪽 [출구 퇴근 기록계 도어락]에 태그하는 카드',
          detailNote: '"老师好! (Lǎoshī hǎo!)" 인증을 통과해 획득한 마스터 카드입니다. 인벤토리에서 이 카드를 클릭해 활성화한 뒤 오른쪽 [출구 퇴근 기록계]를 클릭하세요!',
        },
        successExplanation:
          '맞아요! 선생님께는 "Lǎoshī hǎo! (老师好!)"라고 인사합니다. 서랍 안에서 [🪪 선생님 마스터 출입 카드]를 획득했습니다! 인벤토리에서 카드를 선택해 오른쪽 출구 도어락을 여세요!',
      },
      {
        id: 'r1_p3',
        stageNum: 1,
        title: '로비 출구 퇴근 기록계 도어락 (최종 잠금장치)',
        objectName: '출구 퇴근 기록계 도어락',
        inspectVisualDesc: '제2방으로 통하는 강철 보안문 옆에 붙은 전자식 도어락입니다. 카드 리더기가 깜빡입니다.',
        iconEmoji: '🚪',
        xPercent: 81,
        yPercent: 48,
        widthPercent: 18,
        heightPercent: 38,
        isStageFinal: true,
        requiredItemId: 'item_r1_id_card',
        requiredItemName: '🪪 선생님 마스터 출입 카드',
        lockedHintMessage:
          '🔒 카드 리더기에 마스터 카드를 태그해야 도어락 화면이 켜집니다! 인벤토리에서 [🪪 선생님 마스터 출입 카드]를 클릭해 활성화(선택)한 상태로 이 문을 클릭하세요!',
        lessonRef: '제1과 본문1·표현1 (교과서 26~27쪽)',
        storyContext:
          '출입 카드를 태그하자 도어락 암호창이 켜졌습니다! "수업이 끝나고 친구와 헤어질 때 내일 만나자고 하는 인사말"을 선택하면 문이 열립니다.',
        clueNoteTitle: '📘 교과서 26~27쪽 핵심 단서 노트',
        clueNoteContent:
          '• zàijiàn (再见): 잘 가, 또 만나!\n• míngtiān (明天): 내일 + jiàn (见): 보다, 만나다 → "Míngtiān jiàn! (明天见! - 내일 만나!)"\n• 영어 bye-bye를 음역한 "Báibái! (拜拜!)"도 헤어질 때 자주 써요!',
        pronunciationText: '再见！明天见！',
        question: '수업이 끝나고 친구와 헤어질 때 "내일 만나!"라고 말하는 중국어 표현은?',
        // 정답을 3번(id: 'c_mingtian')에 배치
        options: [
          { id: 'w1', label: 'Nǐ hǎo ma? (你好吗?)', subLabel: '잘 지내니?' },
          { id: 'w2', label: 'Xièxie nǐ! (谢谢你!)', subLabel: '너에게 고마워!' },
          { id: 'c_mingtian', label: 'Míngtiān jiàn! (明天见!)', subLabel: '내일(明天) + 만나다(见)' },
          { id: 'w3', label: 'Wǒ shì xuésheng. (我是学生。)', subLabel: '나는 학생입니다.' },
        ],
        correctOptionId: 'c_mingtian',
        rewardDigit: '',
        rewardItemName: '📜 제1방 통과 인증 쪽지',
        rewardItem: {
          id: 'item_r1_clear_note',
          puzzleId: 'r1_p3',
          stageNum: 1,
          name: '1과 인사말 암호 쪽지 [3]',
          icon: '📜',
          category: 'note',
          shortDesc: '제1방 마스터 코드 숫자 [3]이 기록된 쪽지',
          detailNote: '제1방 핵심 요약: 你好(Nǐ hǎo), 老师好(Lǎoshī hǎo), 再见(Zàijiàn), 明天见(Míngtiān jiàn). 첫 번째 마스터 코드 숫자는 [3]입니다!',
        },
        successExplanation:
          '제1방 탈출 성공! "Míngtiān jiàn! (明天见!)"은 "내일 만나!"라는 뜻입니다. 이제 제2방 [판다 예절과 문화의 방]이 열렸습니다!',
      },
    ],
  },
  {
    stageNum: 2,
    name: '제2방: 판다 예절과 문화의 방',
    chineseTitle: '1. 谢谢 & 对不起 (감사와 사과)',
    pinyinTitle: 'Xièxie & Duìbuqǐ',
    lessonBadge: '1과 · 감사·사과·전통문화 (교과서 28~33쪽)',
    themeColor: '#f59e0b',
    mapCoords: { x: 32, y: 32 },
    roomSubtitle: '판다 돌봄 예절실 · 찻상과 붉은 홍바오 금고',
    storyIntro:
      '제2방은 아기 판다를 돌보는 연구원들의 예절 교육실입니다. 방 안의 [대나무 간식 선반], 물이 쏟아진 [잠긴 다도 찻상 서랍], 그리고 벽면의 [홍바오 금고]를 조사하세요!',
    missionGoal: '① 대나무 선반 조사(비단 손수건 획득) → ② 손수건을 장착해 물 쏟은 찻상 닦기(복(福) 인장 획득) → ③ 인장을 장착해 홍바오 금고 열기!',
    bgThemeClass: 'from-amber-950 via-slate-900 to-orange-950',
    darknessDefault: true,
    puzzles: [
      {
        id: 'r2_p1',
        stageNum: 2,
        title: '대나무 간식 선반과 감사 카드',
        objectName: '대나무 간식 선반',
        inspectVisualDesc: '신선한 대나무 잎이 담긴 바구니 옆에 고운 비단 손수건과 감사 카드가 놓여 있습니다.',
        iconEmoji: '🎋',
        xPercent: 22,
        yPercent: 48,
        widthPercent: 19,
        heightPercent: 28,
        isStageFinal: false,
        lessonRef: '제1과 본문2 (교과서 28~29쪽)',
        storyContext:
          '떨어진 책을 주워 준 친구에게 "Xièxie! (谢谢! - 고마워!)"라고 말했을 때, 상대방이 예의 바르게 답하는 표현을 골라야 선반의 [비단 손수건]을 꺼낼 수 있습니다.',
        clueNoteTitle: '📘 교과서 28~29쪽 핵심 단서 노트',
        clueNoteContent:
          '• Xièxie! (谢谢! : 감사합니다) ↔ 대답: Bú kèqi! (不客气! : 천만에요, 별말씀을요) 또는 Búyòng xiè! (不用谢! : 고맙긴요!)\n• bù(不)의 성조 변화: 원래 제4성(bù)이지만 뒤에 제4성(kè)이 오면 제2성(bú)으로 발음하고 표기도 bú kèqi로 바뀝니다!',
        pronunciationText: '谢谢！不客气！',
        question: '친구가 "Xièxie! (谢谢! - 고마워!)"라고 했을 때, "천만에! (별말씀을!)"라고 답하는 표현은?',
        // 정답을 3번(id: 'c_bukeqi')에 배치
        options: [
          { id: 'w1', label: 'Duìbuqǐ. (对不起。)', subLabel: '미안합니다.' },
          { id: 'w2', label: 'Zǎo! (早!)', subLabel: '좋은 아침!' },
          { id: 'c_bukeqi', label: 'Bú kèqi! (不客气!)', subLabel: '천만에요! (감사 인사의 답)' },
          { id: 'w3', label: 'Wǎn’ān! (晚安!)', subLabel: '잘 자!' },
        ],
        correctOptionId: 'c_bukeqi',
        rewardDigit: '2',
        rewardItemName: '🧣 자수 비단 손수건 + 마스터 숫자 [2]',
        rewardItem: {
          id: 'item_r2_cloth',
          puzzleId: 'r2_p1',
          stageNum: 2,
          name: '자수 비단 손수건',
          icon: '🧣',
          category: 'tool',
          shortDesc: '물이 쏟아진 [전통 다도 찻상]을 닦을 수 있는 손수건',
          detailNote: 'bú kèqi(제2성 성조 변화)를 풀고 얻은 손수건입니다. 모서리에 마스터 숫자 [2]가 수놓아져 있습니다. 인벤토리에서 이 손수건을 클릭해 활성화한 뒤 [물 쏟은 다도 찻상]을 클릭하세요!',
        },
        successExplanation:
          '정답입니다! "Xièxie!(고마워)"의 짝꿍 대답은 "Bú kèqi!(천만에)"입니다. 인벤토리에 [🧣 자수 비단 손수건]과 마스터 숫자 [2]가 추가되었습니다!',
      },
      {
        id: 'r2_p2',
        stageNum: 2,
        title: '물이 쏟아진 전통 다도 찻상과 비밀 서랍',
        objectName: '물 쏟은 다도 찻상',
        inspectVisualDesc: '실수로 찻물이 쏟아져 흥건한 나무 찻상입니다. 물기를 먼저 닦아야 아래 서랍을 열 수 있습니다.',
        iconEmoji: '🍵',
        xPercent: 53,
        yPercent: 62,
        widthPercent: 20,
        heightPercent: 26,
        isStageFinal: false,
        requiredItemId: 'item_r2_cloth',
        requiredItemName: '🧣 자수 비단 손수건',
        lockedHintMessage:
          '💧 찻상 위에 물이 쏟아져 있어 서랍 손잡이가 미끄럽습니다! 먼저 왼쪽 [대나무 간식 선반]에서 [🧣 자수 비단 손수건]을 얻은 뒤, 인벤토리에서 손수건을 클릭(선택)한 상태로 찻상을 클릭하세요!',
        lessonRef: '제1과 본문2·표현2 (교과서 28~29쪽)',
        storyContext:
          '손수건으로 물을 깨끗이 닦자 서랍에서 음성 문제가 흘러나옵니다! 김동민이 실수로 물을 쏟고 "Duìbuqǐ. (对不起 - 미안해)"라고 사과했을 때, 왕징징이 "괜찮아!"라고 답한 표현을 고르세요!',
        clueNoteTitle: '📘 교과서 28~29쪽 핵심 단서 노트',
        clueNoteContent:
          '• 사과할 때: Duìbuqǐ. (对不起 : 미안합니다) / 작은 실수에 가볍게 미안할 때: Bù hǎoyìsi. (不好意思)\n• 사과의 대답("괜찮아"): Méi guānxi. (没关系 : 괜찮습니다) 또는 Méi shìr. (没事儿 : 괜찮아!)',
        pronunciationText: '对不起。没关系。',
        question: '"Duìbuqǐ. (对不起 - 미안합니다)"라고 사과했을 때 "괜찮습니다."라고 답하는 중국어 표현은?',
        // 정답을 2번(id: 'c_meiguanxi')에 배치
        options: [
          { id: 'w1', label: 'Xièxie lǎoshī! (谢谢老师!)', subLabel: '선생님 감사합니다!' },
          { id: 'c_meiguanxi', label: 'Méi guānxi. (没关系。)', subLabel: '괜찮습니다. (사과에 대한 대답)' },
          { id: 'w2', label: 'Míngtiān jiàn! (明天见!)', subLabel: '내일 만나!' },
          { id: 'w3', label: 'Nǐmen hǎo! (你们好!)', subLabel: '너희들 안녕!' },
        ],
        correctOptionId: 'c_meiguanxi',
        rewardDigit: '',
        rewardItemName: '💮 춘절 복(福) 옥도장 열쇠',
        rewardItem: {
          id: 'item_r2_seal_key',
          puzzleId: 'r2_p2',
          stageNum: 2,
          name: '춘절 복(福) 옥도장 열쇠',
          icon: '💮',
          category: 'key',
          shortDesc: '오른쪽 벽면의 [홍바오 문화 금고] 홈에 끼우는 옥도장',
          detailNote: '찻상 서랍 안에서 발견한 붉은 옥도장입니다. 인벤토리에서 이 도장을 클릭해 활성화한 뒤 오른쪽 [홍바오 문화 금고]를 클릭하세요!',
        },
        successExplanation:
          '훌륭해요! "Duìbuqǐ(미안해)" ↔ "Méi guānxi(괜찮아)"는 항상 세트로 기억하세요! 찻상 서랍에서 [💮 춘절 복(福) 옥도장 열쇠]를 획득했습니다!',
      },
      {
        id: 'r2_p3',
        stageNum: 2,
        title: '전통 인사 족자와 홍바오 문화 금고 (최종 잠금장치)',
        objectName: '홍바오(红包) 문화 금고',
        inspectVisualDesc: '붉은 비단 족자 뒤에 숨겨진 황금빛 금고입니다. 정중앙에 복(福) 옥도장을 찍는 홈이 있습니다.',
        iconEmoji: '🧧',
        xPercent: 80,
        yPercent: 45,
        widthPercent: 18,
        heightPercent: 34,
        isStageFinal: true,
        requiredItemId: 'item_r2_seal_key',
        requiredItemName: '💮 춘절 복(福) 옥도장 열쇠',
        lockedHintMessage:
          '🔒 금고 중앙의 홈에 옥도장을 끼워야 금고 다이얼이 작동합니다! 인벤토리에서 [💮 춘절 복(福) 옥도장 열쇠]를 클릭해 활성화(선택)한 상태로 금고를 클릭하세요!',
        lessonRef: '제1과 문화 (교과서 32~33쪽)',
        storyContext:
          '옥도장을 끼우자 금고 화면에 중국의 설날(춘절·春节) 문화 퀴즈가 나타났습니다! 중국에서 새해에 세뱃돈을 넣어 주는 빨간 봉투의 이름은 무엇일까요?',
        clueNoteTitle: '📘 교과서 32~33쪽 중국의 인사법과 문화 노트',
        clueNoteContent:
          '• 전통 인사법: 두 손을 맞잡는 공수(gǒngshǒu 拱手), 한 손으로 주먹을 감싸는 포권(bàoquán 抱拳)\n• 아침 인사: Zǎo!(早! 좋은 아침) / 밤 인사: Wǎn’ān!(晚安! 잘 자) / 새해 인사: Xīnnián hǎo!(新年好!)\n• 중국은 설날인 춘절(Chūnjié 春节)에 행운을 상징하는 빨간색 봉투인 홍바오(hóngbāo 红包)에 세뱃돈을 넣어 줍니다!',
        pronunciationText: '新年好！红包！',
        question: '중국에서 설날(春节)에 "Xīnnián hǎo!(새해 복 많이 받으세요!)"라고 인사하며 세뱃돈을 넣어 주는 빨간색 봉투는?',
        // 정답을 4번(id: 'c_hongbao')에 배치
        options: [
          { id: 'w1', label: 'shǒujī (手机 · 쇼우지)', subLabel: '휴대 전화' },
          { id: 'w2', label: 'xuésheng (学生 · 슈에성)', subLabel: '학생' },
          { id: 'w3', label: 'míngzi (名字 · 밍즈)', subLabel: '이름' },
          { id: 'c_hongbao', label: 'hóngbāo (红包 · 홍바오)', subLabel: '빨간색 세뱃돈 봉투' },
        ],
        correctOptionId: 'c_hongbao',
        rewardDigit: '',
        rewardItemName: '🧧 황금 홍바오 봉투 (2방 마스터 코드 [2])',
        rewardItem: {
          id: 'item_r2_hongbao',
          puzzleId: 'r2_p3',
          stageNum: 2,
          name: '황금 홍바오 봉투 [2]',
          icon: '🧧',
          category: 'note',
          shortDesc: '제2방 마스터 코드 숫자 [2]가 적힌 붉은 봉투',
          detailNote: '제2방 핵심 요약: 谢谢(Xièxie) ↔ 不客气(Bú kèqi), 对不起(Duìbuqǐ) ↔ 没关系(Méi guānxi), 红包(hóngbāo). 두 번째 마스터 코드 숫자는 [2]입니다!',
        },
        successExplanation:
          '제2방 탈출 성공! 빨간 봉투 홍바오(hóngbāo 红包) 속에서 제3방 출입 권한을 얻었습니다!',
      },
    ],
  },
  {
    stageNum: 3,
    name: '제3방: 세계 친구들의 방',
    chineseTitle: '2. 我是韩国人。(이름과 국적)',
    pinyinTitle: 'Wǒ shì Hánguó rén.',
    lessonBadge: '2과 · 이름·국적·성씨 문화 (교과서 36~43쪽)',
    themeColor: '#06b6d4',
    mapCoords: { x: 52, y: 68 },
    roomSubtitle: '국제 판다 후원자 라운지 · 키오스크와 홀로그램 지구본',
    storyIntro:
      '제3방은 전 세계에서 판다를 보러 온 친구들의 명단이 있는 어두운 국제 라운지입니다! 손전등으로 [방문자 명찰 키오스크], [홀로그램 지구본 콘솔], [왕(王)씨 가문 문장 보관함]을 찾아 차례대로 단서를 해독하세요!',
    missionGoal: '① 명찰 키오스크 조사(UV 렌즈 토큰 획득) → ② 토큰을 장착해 지구본 가동(황금 왕관 열쇠 획득) → ③ 왕관 열쇠로 성씨 문장 보관함 열기!',
    bgThemeClass: 'from-cyan-950 via-slate-900 to-blue-950',
    darknessDefault: true,
    puzzles: [
      {
        id: 'r3_p1',
        stageNum: 3,
        title: '국제 방문자 명찰 등록 키오스크',
        objectName: '명찰 등록 키오스크',
        inspectVisualDesc: '터치스크린이 켜진 방문자 명찰 발급기입니다. 투입구에 파란색 UV 렌즈 토큰이 걸려 있습니다.',
        iconEmoji: '📛',
        xPercent: 21,
        yPercent: 54,
        widthPercent: 18,
        heightPercent: 28,
        isStageFinal: false,
        lessonRef: '제2과 본문1·표현1 (교과서 36~37쪽)',
        storyContext:
          '키오스크에서 왕징징이 김동민에게 이름을 묻고 있습니다. "너는 이름이 뭐니?"라는 질문 문장을 완성해야 [UV 렌즈 토큰]이 배출됩니다!',
        clueNoteTitle: '📘 교과서 36~37쪽 핵심 단서 노트',
        clueNoteContent:
          '• jiào (叫): ~(이)라고 부르다 / shénme (什么): 무엇, 무슨 / míngzi (名字): 이름 / ne (呢): ~는요? (되물을 때)\n• 이름 묻기: "Nǐ jiào shénme míngzi? (你叫什么名字？ - 너는 이름이 뭐니?)"\n• 이름 답하기: "Wǒ jiào Jīn Dōngmín. Nǐ ne? (我叫金东民。你呢？ - 나는 김동민이라고 해. 너는?)"',
        pronunciationText: '你叫什么名字？我叫金东民。你呢？',
        question: '"너는 이름이 뭐니?"라고 물을 때 빈칸에 알맞은 단어는? [ Nǐ jiào shénme (        )? ]',
        // 정답을 1번(id: 'c_mingzi')에 배치
        options: [
          { id: 'c_mingzi', label: 'míngzi (名字)', subLabel: '이름 (Nǐ jiào shénme míngzi?)' },
          { id: 'w1', label: 'lǎoshī (老师)', subLabel: '선생님' },
          { id: 'w2', label: 'míngtiān (明天)', subLabel: '내일' },
          { id: 'w3', label: 'gēge (哥哥)', subLabel: '형, 오빠' },
        ],
        correctOptionId: 'c_mingzi',
        rewardDigit: '',
        rewardItemName: '🔍 지구본 UV 렌즈 토큰',
        rewardItem: {
          id: 'item_r3_globe_lens',
          puzzleId: 'r3_p1',
          stageNum: 3,
          name: '지구본 UV 렌즈 토큰',
          icon: '🔍',
          category: 'tool',
          shortDesc: '라운지 중앙의 [홀로그램 지구본]에 끼우는 광학 렌즈',
          detailNote: '명찰 키오스크에서 발급받은 UV 렌즈 토큰입니다. 인벤토리에서 이 렌즈를 클릭해 활성화한 뒤 중앙의 [홀로그램 지구본]을 클릭하세요!',
        },
        successExplanation:
          '정답입니다! "Nǐ jiào shénme míngzi? (你叫什么名字?)"는 상대방의 이름을 묻는 표현입니다! 인벤토리에 [🔍 지구본 UV 렌즈 토큰]이 들어왔습니다!',
      },
      {
        id: 'r3_p2',
        stageNum: 3,
        title: '빛나는 세계지도 홀로그램 지구본',
        objectName: '홀로그램 지구본',
        inspectVisualDesc: '전 세계 국적이 표시된 대형 지구본입니다. 하단 슬롯에 UV 렌즈 토큰을 끼워야 국적 스캐너가 작동합니다.',
        iconEmoji: '🌍',
        xPercent: 51,
        yPercent: 42,
        widthPercent: 20,
        heightPercent: 30,
        isStageFinal: false,
        requiredItemId: 'item_r3_globe_lens',
        requiredItemName: '🔍 지구본 UV 렌즈 토큰',
        lockedHintMessage:
          '🔒 지구본의 홀로그램 렌즈가 비어 있습니다! 먼저 왼쪽 [명찰 등록 키오스크]를 풀어 [🔍 지구본 UV 렌즈 토큰]을 얻은 뒤, 인벤토리에서 렌즈를 클릭(선택)한 상태로 지구본을 클릭하세요!',
        lessonRef: '제2과 본문2·표현2 (교과서 38~39쪽)',
        storyContext:
          'UV 렌즈를 끼우자 지구본이 한국(韩国)과 중국(中国)을 비춥니다! 이한나가 장페이에게 "Nǐ shì nǎ guó rén? (너는 어느 나라 사람이니?)"라고 물었을 때, 자신의 국적을 소개하는 문장을 완성해 보세요!',
        clueNoteTitle: '📘 교과서 38~39쪽 핵심 단서 노트',
        clueNoteContent:
          '• shì (是): ~이다, 네 / bú shì (不是): ~이 아니다, 아니요\n• Zhōngguó (中国: 중국), Hánguó (韩国: 한국), Měiguó (美国: 미국), Rìběn (日本: 일본), Yìndù (印度: 인도), rén (人: 사람)\n• 국적 묻기: "Nǐ shì nǎ guó rén? (你是哪国人? - 너는 어느 나라 사람이니?)"\n• 국적 답하기: "Wǒ shì Hánguó rén. (我是韩国人。 - 나는 한국 사람이야.)"',
        pronunciationText: '你是哪国人？我是韩国人。',
        question: '"나는 한국 사람입니다."를 중국어로 올바르게 표현한 문장은?',
        // 정답을 3번(id: 'c_hanguoren')에 배치
        options: [
          { id: 'w1', label: 'Wǒ bú shì lǎoshī. (我不是老师。)', subLabel: '나는 선생님이 아닙니다.' },
          { id: 'w2', label: 'Tā shì wǒ gēge. (他是我哥哥。)', subLabel: '그는 나의 형입니다.' },
          { id: 'c_hanguoren', label: 'Wǒ shì Hánguó rén. (我是韩国人。)', subLabel: '나(我) + 이다(是) + 한국(韩国) + 사람(人)' },
          { id: 'w3', label: 'Wǒ yǒu shǒujī. (我有手机。)', subLabel: '나는 휴대 전화가 있습니다.' },
        ],
        correctOptionId: 'c_hanguoren',
        rewardDigit: '',
        rewardItemName: '👑 황금 왕(王)씨 문장 열쇠',
        rewardItem: {
          id: 'item_r3_crown_key',
          puzzleId: 'r3_p2',
          stageNum: 3,
          name: '황금 왕(王)씨 문장 열쇠',
          icon: '👑',
          category: 'key',
          shortDesc: '오른쪽 [성씨 가문 문장 보관함]을 여는 왕관 모양 열쇠',
          detailNote: '지구본 내부 보관함에서 나온 왕관 열쇠입니다. 인벤토리에서 이 열쇠를 클릭해 활성화한 뒤 오른쪽 [왕(王)씨 가문 문장 자물쇠]를 클릭하세요!',
        },
        successExplanation:
          '정답입니다! "Wǒ shì Hánguó rén. (我是韩国人。)"은 "나는 한국 사람입니다."라는 뜻이에요! 지구본 속에서 [👑 황금 왕(王)씨 문장 열쇠]를 획득했습니다!',
      },
      {
        id: 'r3_p3',
        stageNum: 3,
        title: '중국 성씨와 호칭 비밀 보드 (최종 잠금장치)',
        objectName: '왕(王)씨 가문 문장 자물쇠',
        inspectVisualDesc: '중국 성씨 통계표가 새겨진 화려한 청동 문장 자물쇠입니다. 왕관 모양 열쇠 구멍이 있습니다.',
        iconEmoji: '👑',
        xPercent: 80,
        yPercent: 56,
        widthPercent: 18,
        heightPercent: 32,
        isStageFinal: true,
        requiredItemId: 'item_r3_crown_key',
        requiredItemName: '👑 황금 왕(王)씨 문장 열쇠',
        lockedHintMessage:
          '🔒 청동 문장 자물쇠가 잠겨 있습니다! 인벤토리에서 [👑 황금 왕(王)씨 문장 열쇠]를 클릭해 활성화(선택)한 상태로 이 자물쇠를 클릭하세요!',
        lessonRef: '제2과 문화 (교과서 42~43쪽)',
        storyContext:
          '왕관 열쇠를 꽂자 문장이 회전합니다! 중국에서 가장 많은 성씨 1위이자, 임금 왕(王) 자의 획수가 세 번째 마스터 코드 숫자입니다!',
        clueNoteTitle: '📘 교과서 42~43쪽 중국의 성씨와 호칭 노트',
        clueNoteContent:
          '• 중국에서 가장 많은 성씨 TOP 4: 1위 Wáng(王 · 7.21%), 2위 Lǐ(李 · 7.18%), 3위 Zhāng(张 · 6.78%), 4위 Liú(刘 · 5.12%)\n• 친근한 호칭: 성이나 이름 앞에 xiǎo(小)를 붙여 Xiǎo Wáng(小王)이라고 부르거나 마지막 글자를 반복(Lìli 丽丽)해요.\n• shīfu(师傅): 기술자나 운전기사 호칭 / xiānsheng(先生): 성인 남성 존칭\n• 힌트: 한자 王(임금 왕)은 가로획 3개 + 세로획 1개로 총 [4]획입니다!',
        pronunciationText: '王晶晶，小王，王先生',
        question: '중국에서 가장 많은 성씨 1위(약 7.21%)이자, 판다 연구원 왕징징(王晶晶)의 성씨인 것은?',
        // 정답을 2번(id: 'c_wang')에 배치
        options: [
          { id: 'w1', label: 'Pǔ (朴 · 박씨)', subLabel: '한국의 대표적인 성씨' },
          { id: 'c_wang', label: 'Wáng (王 · 왕씨)', subLabel: '중국 성씨 1위 (4획 → 코드 숫자 4!)' },
          { id: 'w2', label: 'Cuī (崔 · 최씨)', subLabel: '한국의 대표적인 성씨' },
          { id: 'w3', label: 'Měi (美 · 미씨)', subLabel: '미국(美国)에 쓰이는 글자' },
        ],
        correctOptionId: 'c_wang',
        rewardDigit: '4',
        rewardItemName: '📜 2과 성씨 족보 쪽지 + 마스터 숫자 [4]',
        rewardItem: {
          id: 'item_r3_clear_note',
          puzzleId: 'r3_p3',
          stageNum: 3,
          name: '2과 왕(王)씨 문장 쪽지 [4]',
          icon: '📜',
          category: 'note',
          shortDesc: '제3방 마스터 코드 숫자 [4]가 적힌 족보 쪽지',
          detailNote: '제3방 핵심 요약: 你叫什么名字?(이름), 我是韩国人(국적), 중국 성씨 1위 王(Wáng, 4획). 세 번째 마스터 코드 숫자는 [4]입니다!',
        },
        successExplanation:
          '제3방 탈출 성공! 중국 성씨 1위는 Wáng(王)씨입니다! 세 번째 마스터 코드 숫자 [4]를 획득하고 제4방 [판다 가족과 학교 소개실]을 열었습니다!',
      },
    ],
  },
  {
    stageNum: 4,
    name: '제4방: 판다 가족과 학교 소개실',
    chineseTitle: '3. 他是谁? (가족·나이·학년)',
    pinyinTitle: 'Tā shì shéi?',
    lessonBadge: '3과 · 가족·나이·학교생활 (교과서 48~55쪽)',
    themeColor: '#a855f7',
    mapCoords: { x: 70, y: 30 },
    roomSubtitle: '판다 가족 가계도 전시실 · 액자·나이 스캐너·사물함',
    storyIntro:
      '아기 판다 바오바오가 있는 가족 소개실입니다! 벽에 걸린 [사육사 가족사진 액자], 배터리팩이 빠진 [나이 측정 스캐너], 그리고 자물쇠로 잠긴 [중학교 2학년 사물함]을 조사하세요!',
    missionGoal: '① 가족 액자 조사(배터리팩 획득) → ② 배터리를 장착해 나이 스캐너 가동(사물함 열쇠 획득) → ③ 열쇠를 장착해 중학교 사물함 열기!',
    bgThemeClass: 'from-purple-950 via-slate-900 to-indigo-950',
    darknessDefault: true,
    puzzles: [
      {
        id: 'r4_p1',
        stageNum: 4,
        title: '디지털 가족사진 액자 뒷면 보관함',
        objectName: '사육사 가족사진 액자',
        inspectVisualDesc: '벽에 걸린 따뜻한 가족사진 액자입니다. 액자 뒷면에 스캐너용 보조 배터리가 숨겨져 있습니다.',
        iconEmoji: '🖼️',
        xPercent: 22,
        yPercent: 46,
        widthPercent: 18,
        heightPercent: 28,
        isStageFinal: false,
        lessonRef: '제3과 본문1·표현1 (교과서 48~49쪽)',
        storyContext:
          '액자 속 인물을 가리키며 이한나가 "Tā shì shéi? (他是谁? - 그는 누구니?)"라고 묻자, 장페이가 "그는 우리 형(오빠)이야."라고 답합니다.',
        clueNoteTitle: '📘 교과서 48~49쪽 가족 호칭 단서 노트',
        clueNoteContent:
          '• shéi (谁): 누구 / Tā shì shéi? (他是谁? : 그는 누구니?)\n• 가족 호칭:\n  - bàba (爸爸: 아빠), māma (妈妈: 엄마)\n  - gēge (哥哥: 형, 오빠), jiějie (姐姐: 누나, 언니)\n  - dìdi (弟弟: 남동생), mèimei (妹妹: 여동생)',
        pronunciationText: '他是谁？他是我哥哥。',
        question: '"Tā shì shéi? (그는 누구니?)"라는 질문에 "그는 나의 형(오빠)이야."라고 답할 때 빈칸에 들어갈 단어는? [ Tā shì wǒ (        ). ]',
        // 정답을 4번(id: 'c_gege')에 배치
        options: [
          { id: 'w1', label: 'mèimei (妹妹)', subLabel: '여동생' },
          { id: 'w2', label: 'māma (妈妈)', subLabel: '엄마' },
          { id: 'w3', label: 'shǒujī (手机)', subLabel: '휴대 전화' },
          { id: 'c_gege', label: 'gēge (哥哥)', subLabel: '형, 오빠' },
        ],
        correctOptionId: 'c_gege',
        rewardDigit: '',
        rewardItemName: '🔋 스캐너 고출력 배터리팩',
        rewardItem: {
          id: 'item_r4_battery',
          puzzleId: 'r4_p1',
          stageNum: 4,
          name: '스캐너 고출력 배터리팩',
          icon: '🔋',
          category: 'tool',
          shortDesc: '전원이 꺼진 중앙의 [나이 스캐너]를 켜는 배터리',
          detailNote: '가족사진 액자 뒷면에서 찾아낸 배터리입니다. 인벤토리에서 이 배터리를 클릭해 활성화한 뒤 중앙의 [나이 스캐너]를 클릭하세요!',
        },
        successExplanation:
          '정답입니다! 형/오빠는 중국어로 gēge(哥哥)라고 합니다! 액자 뒷면에서 [🔋 스캐너 고출력 배터리팩]을 획득했습니다!',
      },
      {
        id: 'r4_p2',
        stageNum: 4,
        title: '사육사 형의 나이 측정 스캐너',
        objectName: '나이 스캐너 (多大 / 岁)',
        inspectVisualDesc: '생체 나이를 측정하는 디지털 단말기입니다. 배터리 슬롯이 비어 있어 전원이 들어오지 않습니다.',
        iconEmoji: '🎂',
        xPercent: 52,
        yPercent: 60,
        widthPercent: 20,
        heightPercent: 26,
        isStageFinal: false,
        requiredItemId: 'item_r4_battery',
        requiredItemName: '🔋 스캐너 고출력 배터리팩',
        lockedHintMessage:
          '⚡ 나이 스캐너의 전원이 꺼져 있습니다! 먼저 왼쪽 [사육사 가족사진 액자]에서 [🔋 스캐너 고출력 배터리팩]을 얻은 뒤, 인벤토리에서 배터리를 클릭(선택)한 상태로 스캐너를 클릭하세요!',
        lessonRef: '제3과 본문1·표현1 (교과서 48~49쪽)',
        storyContext:
          '배터리를 끼우자 장페이의 형이 올해 몇 살인지 묻는 음성 기록이 재생됩니다: "Tā jīnnián duō dà? (그 사람 올해 몇 살이니?)" → "Shíbā suì. (18살이야!)"',
        clueNoteTitle: '📘 교과서 48~49쪽 나이 묻고 답하기 노트',
        clueNoteContent:
          '• jīnnián (今年: 올해), duō dà (多大: 몇 살 - 동년배에게 물을 때), suì (岁: 살, 세)\n• 대상별 나이 묻기:\n  - 동년배: Nǐ duō dà? (你多大?)\n  - 어른(연장자): Nín duō dà niánjì? (您多大年纪?)\n  - 10살 미만 어린이: Nǐ jǐ suì? (你几岁?)\n• 본문 대화: "Tā jīnnián duō dà?" → "Shíbā suì. (十八岁 · 18살)"',
        pronunciationText: '他今年多大？十八岁。',
        question: '나이를 말할 때 숫자 뒤에 붙여 "~살(세)"을 나타내는 중국어 단어는? (예: Shíbā ____ = 18살)',
        // 정답을 2번(id: 'c_sui')에 배치
        options: [
          { id: 'w1', label: 'guó (国 · 나라)', subLabel: '나라 (Hánguó)' },
          { id: 'c_sui', label: 'suì (岁 · 세/살)', subLabel: '나이를 세는 단위 (Shíbā suì = 18살)' },
          { id: 'w2', label: 'bǐ (笔 · 필기구)', subLabel: '연필, 펜' },
          { id: 'w3', label: 'men (们 · ~들)', subLabel: '복수형 접미사' },
        ],
        correctOptionId: 'c_sui',
        rewardDigit: '8',
        rewardItemName: '🗝️ 여동생 사물함 은빛 열쇠 + 마스터 숫자 [8]',
        rewardItem: {
          id: 'item_r4_locker_key',
          puzzleId: 'r4_p2',
          stageNum: 4,
          name: '여동생 사물함 은빛 열쇠',
          icon: '🗝️',
          category: 'key',
          shortDesc: '오른쪽 [중학교 2학년 사물함]을 여는 은빛 열쇠',
          detailNote: '18살(Shíbā suì) 퀴즈를 풀고 얻은 사물함 열쇠입니다. 열쇠고리에 네 번째 마스터 숫자 [8]이 적혀 있습니다. 인벤토리에서 이 열쇠를 클릭해 활성화한 뒤 오른쪽 [초중(初中) 2학년 사물함]을 클릭하세요!',
        },
        successExplanation:
          '정답입니다! 나이는 숫자 뒤에 suì(岁)를 붙여요. 본문 속 형의 나이 18살(Shíbā suì)에서 네 번째 마스터 숫자 [8]과 [🗝️ 여동생 사물함 은빛 열쇠]를 획득했습니다!',
      },
      {
        id: 'r4_p3',
        stageNum: 4,
        title: '왕징징 여동생의 중학교 사물함 (최종 잠금장치)',
        objectName: '초중(初中) 2학년 사물함',
        inspectVisualDesc: '학생 가방과 모자(帽子)가 보관된 철제 사물함입니다. 은빛 열쇠로 여는 자물쇠가 걸려 있습니다.',
        iconEmoji: '🎒',
        xPercent: 79,
        yPercent: 44,
        widthPercent: 18,
        heightPercent: 34,
        isStageFinal: true,
        requiredItemId: 'item_r4_locker_key',
        requiredItemName: '🗝️ 여동생 사물함 은빛 열쇠',
        lockedHintMessage:
          '🔒 사물함 문이 잠겨 있습니다! 인벤토리에서 [🗝️ 여동생 사물함 은빛 열쇠]를 클릭해 활성화(선택)한 상태로 이 사물함을 클릭하세요!',
        lessonRef: '제3과 본문2·표현2 (교과서 50~51쪽)',
        storyContext:
          '은빛 열쇠로 사물함을 열자 아기 판다 이동 케이지가 보입니다! 왕징징의 여동생(mèimei)이 다니는 학교와 학년 표현을 맞히면 케이지 잠금이 해제됩니다!',
        clueNoteTitle: '📘 교과서 50~51쪽 소유·학교·학년 단서 노트',
        clueNoteContent:
          '• yǒu (有: 있다) ↔ méiyǒu (没有: 없다)\n  - 소지품 단어: bǐ (笔: 필기구), shǒujī (手机: 휴대 전화), màozi (帽子: 모자)\n• shàng (上: ~에 다니다), niánjí (年级: 학년)\n• 중국의 학교 명칭:\n  - xiǎoxué (小学: 초등학교), chūzhōng (初中: 중학교), gāozhōng (高中: 고등학교), dàxué (大学: 대학교)\n• 본문2 대화: "Tā shàng jǐ niánjí? (그녀는 몇 학년에 다니니?)" → "Chūzhōng èr niánjí. (初中二年级 · 중학교 2학년)"',
        pronunciationText: '你有妹妹吗？有，这是我妹妹。她上几年级？初中二年级。',
        question: '왕징징의 여동생 학년인 "Chūzhōng èr niánjí (初中二年级)"의 뜻으로 알맞은 것은?',
        // 정답을 3번(id: 'c_chuzhong2')에 배치
        options: [
          { id: 'w1', label: '초등학교 1학년', subLabel: 'xiǎoxué yī niánjí' },
          { id: 'w2', label: '고등학교 3학년', subLabel: 'gāozhōng sān niánjí' },
          { id: 'c_chuzhong2', label: '중학교 2학년', subLabel: 'chūzhōng(중학교) + èr(2) + niánjí(학년)' },
          { id: 'w3', label: '대학교 4학년', subLabel: 'dàxué sì niánjí' },
        ],
        correctOptionId: 'c_chuzhong2',
        rewardDigit: '',
        rewardItemName: '📜 3과 학년 학생증 쪽지 [8]',
        rewardItem: {
          id: 'item_r4_clear_note',
          puzzleId: 'r4_p3',
          stageNum: 4,
          name: '3과 학생증 암호 쪽지 [8]',
          icon: '📜',
          category: 'note',
          shortDesc: '제4방 마스터 코드 숫자 [8]이 기록된 학생증',
          detailNote: '제4방 핵심 요약: 他是谁?(누구), 十八岁(18살), 初中二年级(중학교 2학년). 네 번째 마스터 코드 숫자는 [8]입니다!',
        },
        successExplanation:
          '제4방 탈출 성공! 중국어로 중학교는 chūzhōng(初中), 2학년은 èr niánjí(二年级)라고 합니다! 이제 아기 판다와 함께 마지막 제5방으로 이동하세요!',
      },
    ],
  },
  {
    stageNum: 5,
    name: '제5방: 쓰촨성 자연보호구역 최종 탈출구',
    chineseTitle: 'FINAL. 大熊猫自然保护区 (최종 탈출)',
    pinyinTitle: 'Dàxióngmāo Zìrán Bǎohùqū',
    lessonBadge: '1~3과 총정리 & 교과 연계 · 문화 (교과서 44~55쪽)',
    themeColor: '#ec4899',
    mapCoords: { x: 88, y: 66 },
    roomSubtitle: '밤안개가 낀 대나무 숲 출구 · 최종 5자리 마스터 금고',
    storyIntro:
      '푸른 대나무 숲이 보이는 마지막 자연보호구역 출구입니다! [찻자리 몸짓 언어 비석], [중국 학사일정 달력 제어판], 그리고 [최종 마스터 게이트 금고]를 차례대로 조사해 완전 탈출하세요!',
    missionGoal: '① 몸짓 비석 조사(판다 옥패 획득) → ② 옥패를 장착해 달력 제어판 열기(마스터 보안키 획득) → ③ 보안키를 장착해 최종 탈출 게이트 개방!',
    bgThemeClass: 'from-rose-950 via-slate-900 to-emerald-950',
    darknessDefault: true,
    puzzles: [
      {
        id: 'r5_p1',
        stageNum: 5,
        title: '대나무 숲 찻자리 몸짓 언어 비석',
        objectName: '차(茶) 예절과 보호 동물 비석',
        inspectVisualDesc: '대나무 숲 입구에 세워진 고풍스러운 돌비석입니다. 비석 상단에 초록빛 판다 옥패가 박혀 있습니다.',
        iconEmoji: '🐼',
        xPercent: 23,
        yPercent: 54,
        widthPercent: 18,
        heightPercent: 28,
        isStageFinal: false,
        lessonRef: '교과 연계 1·2 (교과서 44~45쪽)',
        storyContext:
          '비석에 중국의 몸짓 언어와 멸종 위기 동물에 대한 설명이 적혀 있습니다. 올바른 설명을 골라 비석의 [판다 옥패]를 획득하세요!',
        clueNoteTitle: '📘 교과서 44~45쪽 중국의 몸짓 언어 & 멸종 위기 동물 노트',
        clueNoteContent:
          '• 차(茶) 감사 인사: 상대방이 차를 따라줄 때 손가락을 구부려 탁자를 가볍게 두드리는 동작은 "고맙다(Xièxie)"는 뜻입니다!\n• 손가락 3개를 하늘로 치켜 올리는 동작 = "맹세한다"는 뜻\n• 중국의 멸종 위기 동물 3총사:\n  1) 자이언트 판다 (dàxióngmāo 大熊猫) - 쓰촨성 서식, 판다 외교\n  2) 황금 원숭이 (jīnsīhóu 金丝猴) - 손오공의 모델\n  3) 양쯔강 돌고래 (báijìtún 白暨豚) - 창장강에 사는 "물속의 판다, 하얀 여신"',
        pronunciationText: '大熊猫，金丝猴，谢谢！',
        question: '중국에서 상대방이 차(茶)를 따라줄 때 손가락을 구부려 탁자를 가볍게 두드리는 몸짓의 의미는?',
        // 정답을 2번(id: 'c_tea_thanks')에 배치
        options: [
          { id: 'w1', label: '미안합니다 (Duìbuqǐ · 사과 표현)', subLabel: '실수했을 때 하는 표현' },
          { id: 'c_tea_thanks', label: '고맙습니다 (Xièxie · 감사 표현)', subLabel: '차 예절에서 유래한 감사의 몸짓 언어' },
          { id: 'w2', label: '조용히 하세요', subLabel: '정숙 요청' },
          { id: 'w3', label: '배가 고파요', subLabel: '식사 요청' },
        ],
        correctOptionId: 'c_tea_thanks',
        rewardDigit: '',
        rewardItemName: '🟢 쓰촨성 판다 옥패(玉牌)',
        rewardItem: {
          id: 'item_r5_jade_token',
          puzzleId: 'r5_p1',
          stageNum: 5,
          name: '쓰촨성 판다 옥패',
          icon: '🟢',
          category: 'key',
          shortDesc: '중앙의 [새 학년 시작 달력 제어판] 홈에 끼우는 옥패',
          detailNote: '몸짓 언어 비석에서 얻은 에메랄드빛 판다 옥패입니다. 인벤토리에서 이 옥패를 클릭해 활성화한 뒤 중앙의 [새 학년 시작 달력 제어판]을 클릭하세요!',
        },
        successExplanation:
          '정답입니다! 차를 따라줄 때 손가락으로 탁자를 톡톡 두드리는 것은 "고맙습니다(Xièxie)"라는 뜻입니다! [🟢 쓰촨성 판다 옥패]를 획득했습니다!',
      },
      {
        id: 'r5_p2',
        stageNum: 5,
        title: '중국 학교생활 달력 제어판',
        objectName: '새 학년 시작 달력 제어판',
        inspectVisualDesc: '1월부터 12월까지 표시된 전자 달력 제어판입니다. 판다 옥패를 끼우는 원형 홈이 있습니다.',
        iconEmoji: '📅',
        xPercent: 52,
        yPercent: 40,
        widthPercent: 20,
        heightPercent: 28,
        isStageFinal: false,
        requiredItemId: 'item_r5_jade_token',
        requiredItemName: '🟢 쓰촨성 판다 옥패',
        lockedHintMessage:
          '🔒 달력 제어판 덮개가 닫혀 있습니다! 먼저 왼쪽 [차(茶) 예절 비석]에서 [🟢 쓰촨성 판다 옥패]를 얻은 뒤, 인벤토리에서 옥패를 클릭(선택)한 상태로 달력 제어판을 클릭하세요!',
        lessonRef: '제3과 문화 (교과서 54~55쪽)',
        storyContext:
          '판다 옥패를 끼우자 달력 화면이 켜집니다! "중국의 새 학년이 시작되는 달(月)이 마지막 다섯 번째 마스터 코드 숫자입니다!"',
        clueNoteTitle: '📘 교과서 54~55쪽 중국의 학교생활 문화 노트',
        clueNoteContent:
          '• 중국 학교의 하루: 등교 → 중간 체조 → 점심시간 → 눈 체조(하루 2번 눈 피로 풀기) → 하교\n• 한국과 다른 점:\n  1) 한국은 3월에 새 학년이 시작되지만, 중국은 매년 [ 9월 ]에 새 학년이 시작됩니다!\n  2) 중국 학교는 입학부터 졸업까지 학급 친구들과 담임 선생님이 바뀌지 않는 경우가 많아요.',
        pronunciationText: '初中二年级，九月',
        question: '한국은 3월에 새 학년이 시작됩니다. 교과서 55쪽에 나온 중국의 새 학년이 시작되는 달은 몇 월일까요?',
        // 정답을 4번(id: 'c_sep9')에 배치
        options: [
          { id: 'w1', label: '3월', subLabel: '한국의 새 학년 시작 달' },
          { id: 'w2', label: '6월', subLabel: '여름방학 직전' },
          { id: 'w3', label: '12월', subLabel: '겨울' },
          { id: 'c_sep9', label: '9월 (코드 숫자 9!)', subLabel: '중국은 매년 9월에 1학기가 시작돼요!' },
        ],
        correctOptionId: 'c_sep9',
        rewardDigit: '9',
        rewardItemName: '🗝️ 최종 마스터 황금 열쇠 + 마스터 숫자 [9]',
        rewardItem: {
          id: 'item_r5_master_key',
          puzzleId: 'r5_p2',
          stageNum: 5,
          name: '최종 마스터 황금 열쇠 [3-2-4-8-9]',
          icon: '🗝️',
          category: 'key',
          shortDesc: '오른쪽 [자연보호구역 최종 탈출 게이트]를 여는 마스터 열쇠',
          detailNote: '다섯 번째 마스터 숫자 [9]까지 모두 모아 완성된 황금 열쇠입니다! 전체 마스터 코드 [3 - 2 - 4 - 8 - 9]가 새겨져 있습니다. 인벤토리에서 이 황금 열쇠를 클릭해 활성화한 뒤 오른쪽 [최종 5자리 마스터 금고]를 클릭하세요!',
        },
        successExplanation:
          '정답입니다! 중국은 매년 [9]월에 새 학년이 시작됩니다! 드디어 5개의 마스터 숫자 [3 - 2 - 4 - 8 - 9]가 모두 모인 [🗝️ 최종 마스터 황금 열쇠]를 획득했습니다!',
      },
      {
        id: 'r5_p3',
        stageNum: 5,
        title: '자연보호구역 최종 탈출 게이트 (마스터 코드 제어판)',
        objectName: '최종 5자리 마스터 금고',
        inspectVisualDesc: '대나무 숲 자연보호구역으로 나가는 거대한 철문 제어판입니다. 황금 열쇠 구멍과 5자리 다이얼이 있습니다.',
        iconEmoji: '🔓',
        xPercent: 81,
        yPercent: 56,
        widthPercent: 18,
        heightPercent: 34,
        isStageFinal: true,
        requiredItemId: 'item_r5_master_key',
        requiredItemName: '🗝️ 최종 마스터 황금 열쇠 [3-2-4-8-9]',
        lockedHintMessage:
          '🔒 최종 탈출 게이트를 열려면 마스터 열쇠가 필요합니다! 인벤토리에서 [🗝️ 최종 마스터 황금 열쇠]를 클릭해 활성화(선택)한 상태로 이 게이트를 클릭하세요!',
        lessonRef: '1~3과 종합 마스터 코드',
        storyContext:
          '황금 열쇠를 꽂고 돌리자 마지막 확인 창이 뜹니다! 제1방부터 제5방까지 모은 5개의 마스터 숫자 [ 3 - 2 - 4 - 8 - 9 ]와 아기 판다에게 건네는 작별 인사를 선택해 문을 활짝 여세요!',
        clueNoteTitle: '📘 1~3과 마스터 코드 총정리 노트',
        clueNoteContent:
          '• 제1방 코드 [3]: Nǐ hǎo (제3성 + 제3성 성조 변화)\n• 제2방 코드 [2]: Bú kèqi (4성 bù가 4성 앞에서 제2성 bú로 변화)\n• 제3방 코드 [4]: Wáng (중국 성씨 1위 王의 획수 4획)\n• 제4방 코드 [8]: Shíbā suì (장페이 형의 나이 18살)\n• 제5방 코드 [9]: 중국 학교의 새 학년이 시작되는 9월\n→ 최종 마스터 코드: [ 3 - 2 - 4 - 8 - 9 ]!',
        pronunciationText: '你好！谢谢！我是韩国人。他是谁？再见！',
        question: '지금까지 5개 방에서 모은 마스터 코드 숫자 5자리와, 아기 판다에게 건네는 작별 인사로 올바른 조합은?',
        // 정답을 3번(id: 'c_final_32489')에 배치
        options: [
          {
            id: 'w1',
            label: '코드 [ 1 - 1 - 1 - 1 - 1 ] · "Duìbuqǐ. (미안해)"',
            subLabel: '잘못된 마스터 코드',
          },
          {
            id: 'w2',
            label: '코드 [ 0 - 0 - 0 - 0 - 0 ] · "Bú shì. (아니요)"',
            subLabel: '잘못된 마스터 코드',
          },
          {
            id: 'c_final_32489',
            label: '코드 [ 3 - 2 - 4 - 8 - 9 ] · "Zàijiàn! (再见! - 잘 가, 또 만나!)"',
            subLabel: '1~5방의 모든 단서 숫자와 1과 작별 인사 완벽 일치!',
          },
          {
            id: 'w3',
            label: '코드 [ 5 - 4 - 3 - 2 - 1 ] · "Méiyǒu. (없어요)"',
            subLabel: '잘못된 마스터 코드',
          },
        ],
        correctOptionId: 'c_final_32489',
        rewardDigit: '★',
        rewardItemName: '🏆 아기 판다 구출 완료 황금 훈장',
        rewardItem: {
          id: 'item_r5_trophy',
          puzzleId: 'r5_p3',
          stageNum: 5,
          name: '판다 구출 명예 대원 훈장',
          icon: '🏆',
          category: 'card',
          shortDesc: '제1방~제5방 모든 중국어 암호를 해독한 명예 훈장!',
          detailNote: '축하합니다! 중학교 중국어 1~3과(인사·감사·사과·이름·국적·가족·나이·학년·중국 문화)를 완벽히 마스터하여 아기 판다 바오바오를 자연으로 돌려보냈습니다!',
        },
        successExplanation:
          '축하합니다!! 마스터 코드 [3-2-4-8-9]가 일치하며 자연보호구역 대문이 활짝 열렸습니다! 아기 판다 바오바오가 "Xièxie nǐmen! Zàijiàn!" 하고 손을 흔들며 대나무 숲으로 돌아갔습니다!',
      },
    ],
  },
];

export interface VocabularyItem {
  lesson: string;
  pinyin: string;
  hanzi: string;
  meaning: string;
  tip: string;
}

export const TEXTBOOK_VOCAB_SHEET: VocabularyItem[] = [
  { lesson: '1과', pinyin: 'Nǐ hǎo!', hanzi: '你好!', meaning: '안녕! / 안녕하세요!', tip: '3성+3성 → 앞을 2성처럼 발음' },
  { lesson: '1과', pinyin: 'Nǐmen hǎo!', hanzi: '你们好!', meaning: '너희들 안녕!', tip: 'men(们)은 복수(~들)' },
  { lesson: '1과', pinyin: 'Lǎoshī hǎo!', hanzi: '老师好!', meaning: '선생님 안녕하세요!', tip: 'lǎoshī = 선생님' },
  { lesson: '1과', pinyin: 'Zàijiàn! / Míngtiān jiàn!', hanzi: '再见! / 明天见!', meaning: '잘 가! / 내일 만나!', tip: 'míngtiān(내일) + jiàn(만나다)' },
  { lesson: '1과', pinyin: 'Xièxie! ↔ Bú kèqi!', hanzi: '谢谢! ↔ 不客气!', meaning: '고마워! ↔ 천만에!', tip: '4성 bù + 4성 kè → 2성 bú로 변화' },
  { lesson: '1과', pinyin: 'Duìbuqǐ. ↔ Méi guānxi.', hanzi: '对不起。↔ 没关系。', meaning: '미안해. ↔ 괜찮아.', tip: '작은 실수는 Bù hǎoyìsi(不好意思)' },
  { lesson: '1과 문화', pinyin: 'hóngbāo / Chūnjié', hanzi: '红包 / 春节', meaning: '세뱃돈 붉은 봉투 / 설날(춘절)', tip: '새해 인사: Xīnnián hǎo!(新年好!)' },
  { lesson: '2과', pinyin: 'Nǐ jiào shénme míngzi?', hanzi: '你叫什么名字?', meaning: '너는 이름이 뭐니?', tip: 'jiào(~라고 부르다), míngzi(이름)' },
  { lesson: '2과', pinyin: 'Wǒ jiào ~. Nǐ ne?', hanzi: '我叫~。你呢?', meaning: '나는 ~라고 해. 너는?', tip: 'ne(呢) = ~는요? (되물을 때)' },
  { lesson: '2과', pinyin: 'Nǐ shì nǎ guó rén?', hanzi: '你是哪国人?', meaning: '너는 어느 나라 사람이니?', tip: 'nǎ(어느) + guó(나라) + rén(사람)' },
  { lesson: '2과', pinyin: 'Wǒ shì Hánguó rén.', hanzi: '我是韩国人。', meaning: '나는 한국 사람입니다.', tip: 'Zhōngguó(중국), Měiguó(미국)' },
  { lesson: '2과 문화', pinyin: 'Wáng / Lǐ / Zhāng / Liú', hanzi: '王 / 李 / 张 / 刘', meaning: '중국의 4대 성씨 (1위 왕씨)', tip: '친근한 호칭: Xiǎo Wáng(小王)' },
  { lesson: '3과', pinyin: 'Tā shì shéi? → Tā shì wǒ gēge.', hanzi: '他是谁? → 他是我哥哥。', meaning: '그는 누구니? → 나의 형(오빠)이야.', tip: 'bàba(아빠), māma(엄마), jiějie(누나/언니)' },
  { lesson: '3과', pinyin: 'Tā jīnnián duō dà? → Shíbā suì.', hanzi: '他今年多大? → 十八岁。', meaning: '그는 올해 몇 살이니? → 18살.', tip: '동년배 나이: duō dà(多大), 살/세: suì(岁)' },
  { lesson: '3과', pinyin: 'Nǐ yǒu mèimei ma? → Yǒu / Méiyǒu.', hanzi: '你有妹妹吗? → 有 / 没有。', meaning: '여동생이 있니? → 있어 / 없어.', tip: 'bǐ(필기구), shǒujī(휴대 전화), màozi(모자)' },
  { lesson: '3과', pinyin: 'Tā shàng jǐ niánjí? → Chūzhōng èr niánjí.', hanzi: '她上几年级? → 初中二年级。', meaning: '몇 학년에 다니니? → 중학교 2학년.', tip: '중국 학교는 매년 9월에 새 학년 시작!' },
];
