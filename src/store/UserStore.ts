import { create } from "zustand";
import Cookie from "js-cookie";


export interface IUser {
  avatar_url: string;
  email: string;
  full_name: string;
  user_id: string;
  created_at: string;
}

interface IToken {
  access_token: string;
  expires_at: number | undefined;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

interface IUserStore {
  user: IUser;
  setUser: (user: IUser) => void;
  setToken: (token: IToken) => void;
  logOut: () => void;
}



export const UserStore = create<IUserStore>((set, get) => ({
  user: {
    avatar_url: "",
    email: "",
    full_name: "",
    user_id: "",
    created_at: "",
  },
  token: {
    access_token: "",
    expires_at: 0,
    expires_in: 0,
    refresh_token: "",
    token_type: "",
  },

  setUser: (user) => {
    set({ user });
  },

  setToken: (token) => {
    Cookie.set("access_token", token.access_token, {
      expires: token.expires_at,
      secure: true,
      sameSite: "lax",
    });

    Cookie.set("refresh_token", token.refresh_token, {
      expires: token.expires_at,

      secure: true,
      sameSite: "lax",
    });
  },
  logOut: () => {},
}));
