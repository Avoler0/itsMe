export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  // 계좌 / 송금 정보 (/{username}/pay 에서만 노출)
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  kakao_pay_url: string | null;
  toss_url: string | null;
  // 명함 표시 설정
  show_bio: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_vcard: boolean;
  show_pay: boolean;
  // 명함 테마
  theme: string | null;
  text_color: string | null;
  button_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
  created_at: string;
}

export interface ProfileWithLinks extends Profile {
  links: Link[];
}
