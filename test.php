<?php
class Test {
    public function shareSubmit (Request $request){
        \Log::info("sharecontroller:sharesubmit");
        \Log::info($request);
        $users= $request->get('sheet_list');
        \Log::info("user");
        \Log::info($users);
        $sheet_id = $request->get('sheet_id');
        $created_by = Auth::user()->id;
        $shared_users = SheetUser::where("sheet_users.sheet_id","=",$sheet_id)->get();
        foreach($users as $user){
            $tf = false;
            foreach($shared_users as $sUser) {

                if ($user['id'] == $sUser->user_id) {

                   if ($user['scope'] != $sUser->user_scope) {

                    SheetUser::where("user_id","=",$user['id'])
                        ->where("sheet_id", "=", $sheet_id)
                        ->update(["user_scope" => $user['scope']]);
                   }
                   $tf = true;
                   break;
                }
            }

            if ($tf == false) {

                //insert
                $share = new Share();
                $share->sheet_id = $sheet_id;
                $share->created_by = $created_by;
                $share->user_id = $user['id'];
                $share->save();
                $save_SheetUser = new SheetUser();
                $save_SheetUser->sheet_id = $sheet_id;
                $save_SheetUser->user_id = $user['id'];
                $save_SheetUser->user_scope = $user['scope'];
                $save_SheetUser->deleted = false; // 여기
                $save_SheetUser->save();
            }
        }

        // db 에서 가져온 $shared_users
        foreach($shared_users as $sUser) {

            // payload 로 받아 온 $users
            foreach($users as $user) {

                \Log::info('Check $sUser = ['. $sUser->user_id .'] $user = ['. $user['id'] .']');

                // payload 의 id 와 db 의 user_id 이면 다음 루프로 이동
                if ($user['id'] == $sUser->user_id) {
                    \Log::info('Check $sUser = ['. $sUser->user_id .'] $user = ['. $user['id'] .'] is checked.');
                    continue;
                }

                // db 에서 받아 온 유저가 이미 deleted 상태라면, 다음 루프로 이동
                if ($sUser->deleted == 1) {
                    \Log::info('Check $sUser = ['. $sUser->user_id .'] $user = ['. $user['id'] .'] is aleady deleted.');
                    continue;
                }

                \Log::info('Check $sUser = ['. $sUser->user_id .'] $user = ['. $user['id'] .'] delete.....');
                //삭제
                SheetUser::where("user_id","=",$user['id'])
                    ->where("sheet_id", "=", $sheet_id)
                    ->update([
                        "deleted" => 1
                    ]);
                \Log::info('Check $sUser = ['. $sUser->user_id .'] $user = ['. $user['id'] .'] delete.....finish');
            }
        }
    }
}