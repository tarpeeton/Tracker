"use client";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import Cookie from "js-cookie";
import { IUser, UserStore } from "@/store/UserStore";
import type { User } from "@supabase/supabase-js";

export default function ClientLogic() {
  const { setToken, setUser } = UserStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session olishda xatolik:", error);
          return;
        }

        if (session && session.user) {
          setToken({
            token_type: session.token_type,
            expires_at: session.expires_at,
            expires_in: session.expires_in,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          await createOrUpdateProfile(session.user);
        } else {
          Cookie.remove("access_token");
          Cookie.remove("refresh_token");
          Cookie.remove("provider_token");
        }
      } catch (error) {
        console.error("Kutilmagan xatolik:", error);
      }
    };

    const createOrUpdateProfile = async (user: User) => {

      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Profile tekshirishda xatolik:", fetchError);
          return;
        }

        const profileData: IUser = {
          user_id: user.id,
          full_name:
            user.user_metadata?.full_name || user.user_metadata?.name || "User",
          avatar_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
          email: user.user_metadata?.email || "",
          created_at:
            user.user_metadata?.created_at || new Date().toISOString(),
        };

        if (!existingProfile) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([profileData])
            .select()
            .single();

          if (insertError) {
            console.error("Profile yaratishda xatolik:", insertError);
          } else {
            console.log("Yangi profile yaratildi:", newProfile);
            setUser(profileData);
          }
        } else {
          const updateData = {
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              existingProfile.full_name ||
              "User",
            avatar_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              existingProfile.avatar_url ||
              null,
            email: user.user_metadata?.email || existingProfile.email || "",
            created_at:
              user.user_metadata?.created_at ||
              existingProfile.created_at ||
              new Date().toISOString(),
          };

          const { error: updateError } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("user_id", user.id);

          if (updateError) {
            console.error("Profile yangilashda xatolik:", updateError);
          } else {
            console.log("Profile yangilandi" , updateData);
            setUser({ ...updateData, user_id: user.id });
          }
        }
      } catch (error) {
        console.error("Profile bilan ishlashda xatolik:", error);
      }
    };

    checkSession();
  }, [setToken, setUser]);

  return null;
}
