import { activeLocale, compareText, fmtNumber, fmtNumber as fmtNumber$1, fmtRelative, useAppApi, useChatLauncher, useLanguageGeneration, useNotify } from "@kirocrew/app-sdk";
import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Badge, Btn, Card, CardTitle, Clickable, ContentSkeleton, EmptyState, ErrorNotice, InfoTip, Modal, PageHeader, SearchInput, StatCard } from "@kirocrew/app-sdk/ui";
import { AlertTriangle, Check, ChevronRight, Ellipsis, ExternalLink, FileText, GitCommit, Info, LoaderCircle, Play, RefreshCw, Rocket, RotateCw, Server, ShieldAlert, Square, Trash2, Undo2, Video, X } from "lucide-react";
import { createPortal } from "react-dom";
// src/i18n.ts
/**
* The app's own strings. A bundle cannot read the dashboard's catalogs (those
* belong to the host and change with it), so every locale the dashboard ships is
* bundled here and looked up against the host's active language.
*
* Lookup order: the exact locale (`pt`, `zh-CN`), then its base language, then
* English, then the key itself, so a missing translation shows English rather
* than nothing. `{{name}}` placeholders are filled from `vars`; one with no value
* is left as written. With a numeric `count`, the CLDR plural form of that
* locale is tried first (`result_count_one`, `_few`, `_many`, `_other`), the
* same key shape the dashboard's catalogs use.
*
* `t` reads the language at call time. The root component subscribes to the
* host's language changes (`useLanguageGeneration`), and its re-render reaches
* every child, so a language switch repaints the page without a reload.
*/
var CATALOGS = {
	bn: {
		api: { "client": {
			"proxy_challenge_reload": "এই ব্রাউজার ট্যাব রিলোড করো — যদি সাইন-ইন পেজ আসে, তাহলে তোমার অ্যাক্সেস প্রক্সির সেশন শেষ হয়ে গেছে। না আসলে এই ড্যাশবোর্ডের সামনে থাকা প্রক্সি বা ফায়ারওয়াল অনুরোধ ফিরিয়ে দিয়েছে; প্রক্সির লগ দেখো, বা পরে আবার চেষ্টা করো।",
			"server_temporarily_unavailable_http_status": "সার্ভার সাময়িকভাবে অনুপলব্ধ (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_one": "{{app}} পরপর {{count}} বার পুনরায় চালু হতে ব্যর্থ হয়েছে এবং কয়েক মিনিট পরপর চেষ্টা চালিয়ে যাবে। এখনই আবার চেষ্টা করতে, {{app}} নিষ্ক্রিয় করে আবার সক্রিয় করো।",
				"restart_exhausted_message_other": "{{app}} পরপর {{count}} বার পুনরায় চালু হতে ব্যর্থ হয়েছে এবং কয়েক মিনিট পরপর চেষ্টা চালিয়ে যাবে। এখনই আবার চেষ্টা করতে, {{app}} নিষ্ক্রিয় করে আবার সক্রিয় করো।",
				"restart_exhausted_title": "{{app}} পুনরায় চালু হতে পারছে না"
			},
			"devFleet": { "manifest": {
				"configuration_1": "অ্যাপটিকে Kiro Crew checkout-এর path দিন; PR action-এর জন্য প্রমাণীকৃত gh লাগে, আর pod আগে provision করতে হয় এবং Linux-এ systemd --user, macOS-এ launchd বা Windows-এ Task Scheduler লাগে।",
				"description": "Kiro Crew নিজের ওপর কাজ করার একটি কন্ট্রোল প্যানেল। প্রতিটি ফিচার worktree-কে তার পুল রিকোয়েস্টের অবস্থা, কমিট সংখ্যা ও ডিস্ক ব্যবহারের সঙ্গে তালিকা করে দেখায়, আর যেকোনোটিকে একটি pod হিসেবে চালু করতে পারে: নিজের পোর্টে নিজের ডেটা ডিরেক্টরি নিয়ে একটি পূর্ণ প্রিভিউ ইনস্ট্যান্স, যাতে চালু গেটওয়েতে হাত না দিয়েই অসমাপ্ত কোনো বদল ঘুরে দেখা যায়। সঙ্গের খুচরো কাজগুলোও এটি সামলায় — main টেনে এনে আবার বিল্ড করা, কোনো ব্রাঞ্চ rebase করা, pod-এর লগ স্ট্রিম করা, আর যেসব worktree-র কাজ মার্জ হয়ে গেছে সেগুলো ছেঁটে ফেলা।",
				"display_name": "Dev Fleet",
				"highlight_1": "যেকোনো worktree-কে নিজের পোর্ট ও ডেটা ডিরেক্টরিতে একটি বিচ্ছিন্ন pod হিসেবে চালু করো, চালু গেটওয়েতে কোনো হাত না দিয়েই",
				"highlight_2": "ফ্লিট ভিউতে প্রতি ব্রাঞ্চের PR অবস্থা, কমিট সংখ্যা ও ডিস্ক ব্যবহার",
				"highlight_3": "ড্যাশবোর্ড ছেড়ে না গিয়েই সিঙ্ক করো (main টেনে এনে আবার বিল্ড) বা কোনো ব্রাঞ্চ rebase করো",
				"highlight_4": "'Prune merged' কোনো worktree-তে কমিট না করা বা ট্র্যাক না করা কাজ থাকলে সেটি ফেলে না দিয়ে মুছতেই রাজি হয় না",
				"highlight_5": "UI থেকেই pod-এর লগ স্ট্রিম করো আর pod অ্যাক্সেস টোকেন তৈরি করো",
				"highlight_6": "যারা Kiro Crew নিজেই ডেভেলপ করে তাদের জন্য বানানো — রোজকার ব্যবহারে দরকার নেই",
				"highlight_7": "Pod চলে Linux (systemd --user), macOS (launchd) ও Windows (Task Scheduler)-এ — তবে macOS pod-এ মেমরি/CPU-র কোনো বাধ্যতামূলক সীমা নেই; Make Live সব প্ল্যাটফর্মে পয়েন্টার স্টেজ করে, আর স্বয়ংক্রিয় রিস্টার্টের জন্য systemd --user ইউনিট বা macOS LaunchAgent লাগে; ফ্লিট ভিউ, PR অবস্থা, সিঙ্ক, rebase ও prune সব প্ল্যাটফর্মেই কাজ করে",
				"page_label": "Dev Fleet",
				"use_case_1": "চলমান gateway-তে হাত না দিয়ে Kiro Crew feature worktree ও আলাদা preview pod পরিচালনা করুন।"
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"অ্যাকশন\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"শেষ পুল+বিল্ড প্রয়োগ করে। ড্যাশবোর্ড অল্প সময়ের জন্য বিচ্ছিন্ন হয়ে নিজেই আবার কানেক্ট করবে।\",\"backend_unavailable\":\"ব্যাকএন্ড উপলব্ধ নয়\",\"behind\":\"পিছিয়ে\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"যেকোনো worktree-কে একটি বিচ্ছিন্ন, ব্যবহারের পর ফেলে দেওয়া\\n              গেটওয়ে হিসেবে চালু করে, যাতে আপনি আপনার লাইভ ইনস্ট্যান্সে হাত না দিয়েই একটি ফিচার ব্রাঞ্চ QA করতে পারেন।\",\"branch\":\"ব্রাঞ্চ:\",\"build_finished_restarting_gateway\":\"বিল্ড সম্পূর্ণ — গেটওয়ে পুনরায় চালু হচ্ছে…\",\"build_pending\":\"বিল্ড বাকি\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"বিল্ড বাকি — প্রয়োগ করতে গেটওয়ে রিস্টার্ট করুন (kirocrew restart)\",\"building\":\"বিল্ড হচ্ছে…\",\"built\":\"বিল্ড হয়েরে\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"বিল্ড হয়ে তৈরি — এই ব্রাঞ্চ QA করতে সারির মেনু থেকে একটি pod চালু করো\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"বিল্ড হয়েরে — কিন্তু এই হোস্টে pod চলতে পারে না; বদলে ./dev-backend.sh দিয়ে প্রিবিও করো\",\"cancel\":\"বাতিল করুন\",\"cancel_staged_cutover\":\"স্টেজ করা কাটওভার বাতিল করো\",\"cancel_staged_cutover_2\":\"স্টেজ করা কাটওভার বাতিল করবে?\",\"cannot_remove_the_main_worktree\":\"main worktree সরানো যাবে না\",\"cannot_resolve_worktree_path_for_name\":\"{{name}}-এর worktree পাথ নির্ণয় করা যাচ্ছে না\",\"close\":\"বন্ধ করুন\",\"closed_has_unmerged_commits\":\"বন্ধ PR — main-এ নেই এমন কমিট রয়েছে\",\"closed_pr_not_on_main_hint\":\"বন্ধ, মার্জ না-করা PR — এর বিষয়বস্তু main-এ নেই, তাই সরালে তা স্থায়ীভাবে মুছে যাবে। নির্বাচনের আগে যাচাই করুন।\",\"collapse\":\"সংকুচিত করো\",\"commits\":\"কমিট:\",\"commits_behind_main\":\"main থেকে কত কমিট পিছিয়ে\",\"commits_behind_main_2_one\":\"main থেকে {{count}}টি কমিট পিছিয়ে\",\"commits_behind_main_2_other\":\"main থেকে {{count}}টি কমিট পিছিয়ে\",\"confirm\":\"নিশ্চিত করো\",\"conflicts_aborted\":\"কনফ্লিক্ট — বাতিল করা হয়েছে\",\"created_recently\":\"সম্প্রতি তৈরি\",\"current_step\":\"বর্তমান ধাপ\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"কাটওভার স্টেজ করা হয়েছে: গেটওয়ে পরের বার চালু হলে এই ওয়ার্কট্রি লাইভ হবে। শেষ করতে `{{cmd}}` চালাও, বা ফিরিয়ে নিতে এই সারির মেনু → স্টেজ করা কাটওভার বাতিল করো ব্যবহার করো। তার আগ পর্যন্ত গেটওয়ে আগের চেকআউটেই চলবে।\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"তবুও মুছে ফেলো\",\"design_docs\":\"ডিজাইন ডক:\",\"dev_fleet\":\"ডেভ ফ্লিট\",\"discard_untracked_files\":\"সেই সঙ্গে আনট্র্যাক্ড ফাইলও ({{count}}টি) বাতিল হয়ে যাবে, যার মধ্যে আছে: {{files}}\",\"discovery_error\":\"ডিসকভারি ত্রুটি\",\"disk\":\"ডিস্ক:\",\"disk_usage_unavailable\":\"ডিস্ক ব্যবহার অনুপলব্ধ\",\"disk_worktrees\":\"ডিস্ক (worktrees)\",\"dismiss\":\"খারিজ করুন\",\"dismiss_sync_status\":\"সিঙ্ক স্ট্যাটাস খারিজ করুন\",\"each_row_below_is_a_git_worktree_discovered_from\":\"নিচের প্রতিটি সারি হলো main চেকআউট থেকে পাওয়া একটি git worktree। ব্যবহার করুন\",\"empty_worktree_cannot_be_undone\":\"খালি worktree। এটি ফেরানো যাবে না।\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"main চেকআউটের প্রতিটি git worktree। পুল+বিল্ড main সিঙ্ক করে; pod হলো worktree থেকে চালু করা বিচ্ছিন্ন গেটওয়ে।\",\"expand\":\"প্রসারিত করো\",\"failed\":\"ব্যর্থ\",\"failed_to_load_logs\":\"লগ লোড করা যায়নি\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"সর্বশেষ main ফেচ করে আবার রিপ্লে করে। ডার্টি থাকলে চলবে না; কনফ্লিক্ট হলে রিবেস বাতিল হয়।\",\"filter_worktrees\":\"worktree ফিল্টার করুন…\",\"filter_worktrees_2\":\"worktree ফিল্টার করুন\",\"finished\":\"সম্পন্ন\",\"force_remove\":\"{{name}} জোরপূর্বক সরান\",\"force_remove_confirm_desc_one\":\"{{count}}টি worktree-এ মার্জ না হওয়া বা কমিট না করা কাজ আছে। এটি সরালে সমস্ত লোকাল পরিবর্তন স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যাবে না।\",\"force_remove_confirm_desc_other\":\"{{count}}টি worktree-এ মার্জ না হওয়া বা কমিট না করা কাজ আছে। এগুলো সরালে সমস্ত লোকাল পরিবর্তন স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যাবে না।\",\"force_remove_confirm_title\":\"জোরপূর্বক worktree সরাবেন?\",\"force_remove_warning\":\"নির্বাচিত worktree-গুলোতে মার্জ না হওয়া কাজ আছে — সরানো স্থায়ী এবং ফেরানো যাবে না।\",\"gateway_did_not_come_back_within_60s_reload_the\":\"গেটওয়ে 60s-এর মধ্যে ফিরে আসেনি — পেজটি নিজে রিলোড করো, বা `kirocrew logs` দেখো।\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"সিঙ্কের মাঝে গেটওয়ে রিস্টার্ট হয়েছে — রান হারিয়ে গেছে; git অবস্থা দেখে আবার পুল+বিল্ড চালাও\",\"git_status_failed\":\"git status ব্যর্থ\",\"has_unmerged_work_removing_deletes_permanently\":\"মার্জ না হওয়া কাজ আছে — সরালে তা স্থায়ীভাবে মুছে যাবে।\",\"hide_legacy_worktrees\":\"{{n}}টি লিগ্যাসি worktree লুকাও\",\"hide_logs\":\"লগ লুকাও\",\"issues\":\"ইস্যু:\",\"keep_cutover\":\"কাটওভার রাখো\",\"keeps_name_the_live_target_and_discards_the_stag\":\"“{{name}}” লাইভ লক্ষ্য হিসেবে থেকে যায় এবং “{{staged}}”-এ স্টেজ করা পরিবর্তন বাতিল হয়। কিছুই রিস্টার্ট হয় না — গেটওয়ে এখন যে কোড চালাচ্ছে তা-ই চালাতে থাকে।\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"লাইভ চেকআউট লাইভ লক্ষ্য হিসেবে থেকে যায় এবং {{staged}}-এ স্টেজ করা পরিবর্তন বাতিল হয় (কিছুই রিস্টার্ট হয় না)\",\"keeps_this_checkout_the_live_target_and_discards\":\"এই চেকআউট লাইভ লক্ষ্য হিসেবে থেকে যায় এবং “{{staged}}”-এ স্টেজ করা পরিবর্তন বাতিল হয় (কিছুই রিস্টার্ট হয় না)\",\"kept\":\"রাখা হয়েছে\",\"kept_discard_untracked_hint\":\"শুধু আনট্র্যাক্ড অস্থায়ী ফাইলের কারণে আটকে থাকা সারি: একটি চেক করলে সেই সারিতে তালিকাভুক্ত ফাইলগুলো বাতিল হয়ে যায়।\",\"kept_force_hint\":\"জোরপূর্বক মুছে ফেলার জন্য চেক করুন — অমার্জড কাজ মুছে ফেলে।\",\"last_commit_activity\":\"সর্বশেষ কমিট কার্যকলাপ\",\"legacy_worktrees_hidden_show\":\"{{n}}টি লিগ্যাসি worktree লুকানো আছে · দেখাও\",\"live\":\"লাইভ\",\"live_checkout_changed_to_name\":\"ড্যাশবোর্ড এখন “{{name}}” ব্যবহার করছে।\",\"live_state_unknown\":\"লাইভ অবস্থা পাওয়া যায়নি\",\"live_state_unknown_help\":\"গেটওয়ে জানাতে পারেনি কোন চেকআউটটি লাইভ (যে চেকআউট থেকে গেটওয়ে নিজেই চলে) বা স্টেজ করা, তাই কোনো সারি লাইভ হিসেবে চিহ্নিত নেই — এটি অজানা অবস্থা, খালি নয়। কোনো চেকআউট লাইভ করার আগে এজেন্টকে জিজ্ঞাসা করো।\",\"live_unverified\":\"লাইভ?\",\"load_pod_logs\":\"pod-এর লগ লোড করো\",\"loading\":\"লোড হচ্ছে…\",\"log\":\"লগ ▴\",\"log_2\":\"লগ ▾\",\"main\":\"· main\",\"make_live\":\"লাইভ করো\",\"make_live_failed\":\"লাইভ করা যায়নি\",\"make_name_live\":\"“{{name}}”-কে লাইভ করবে?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"আপনার main চেকআউটের git worktree পরিচালনা করুন — সিঙ্ক, রিবেস, QA pod এবং ক্লিনআপ সব এক জায়গায়।\",\"marked_live_but_this_install_cant_confirm_it\":\"প্যাকেজড ইনস্টল: এই চেকআউট চলছে কিনা নিশ্চিত করা যায় না।\",\"more_actions\":\"আরও অ্যাকশন\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"একটি ফিচার ব্রাঞ্চকে সর্বশেষ main-এর উপরে সরিয়ে নেয়, এবং\",\"needs_provision\":\"প্রভিশন প্রয়োজন\",\"no_candidates_found\":\"কোনো সম্ভাব্য আইটেম পাওয়া যায়নি।\",\"no_checkout_found\":\"কোনো {{productName}} চেকআউট পাওয়া যায়নি\",\"no_checkout_found_action\":\"{{productName}} ডেটা ডিরেক্টরির (ডিফল্ট ~/.kiro/crew) config.json-এ dev_fleet.repo_path যোগ করো, আর এই পেজ পরের রিফ্রেশেই সেই পথ পড়ে নেবে। নিচের এনভায়রনমেন্ট ভেরিয়েবলও কাজ করে, কিন্তু চালু থাকা গেটওয়ে শুরুর পরে সেট করা ভেরিয়েবল দেখতে পায় না, তাই ওই পথে রিস্টার্ট দরকার।\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/চেকআউট/এর/পথ\",\"no_checkout_found_help\":\"Dev Fleet একটি {{productName}} সোর্স চেকআউটের git worktree পরিচালনা করে। আপনার প্রজেক্ট ডিরেক্টরি, এই ড্যাশবোর্ড পরিবেশনকারী চেকআউট, বা সাধারণ ক্লোন লোকেশনে কোনোটি পাওয়া যায়নি।\",\"no_commits_stale\":\"কোনো কমিট নেই, পুরোনো\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"এখনও venv/UI বিল্ড নেই — প্রভিশন এই worktree বিল্ড করে যাতে একটি pod চলতে পারে\",\"no_worktrees_found\":\"কোনো worktree পাওয়া যায়নি\",\"not_built\":\"বিল্ড হয়নি\",\"nothing_selected\":\"কিছু নির্বাচন করা হয়নি\",\"nothing_to_prune\":\"ছাঁটাই করার কিছু নেই\",\"nothing_under_the_worktrees_root_yet\":\"worktree রুটে এখনো কিছু নেই।\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"main সারিতে — origin থেকে এটিকে fast-forward করে আবার বিল্ড করতে\\n              (তারপর প্রয়োগ করতে গেটওয়ে রিস্টার্ট করুন)।\",\"open\":\"খোলো\",\"orphan_pods_label\":\"অনাথ পড হোম: {{value}}\",\"parked_on_branch\":\"{{branch}}-এ থেমে আছে\",\"pending\":\"অপেক্ষমাণ\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"Pod এবং “লাইভ করো” অ্যাকশন লুকানো আছে; এই পেজের বাকি সব স্বাভাবিকভাবে কাज করে।\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"পড CPU ব্যবহার\",\"pod_home_disk\":\"পড-হোম ডিস্ক: {{value}}\",\"pod_home_size\":\"পড হোম: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"কোনও সক্রিয় পড ছাড়াই ডিস্কে থাকা পড হোম\",\"pod_memory\":\"মেমরি: {{value}}\",\"pod_memory_of_ceiling\":\"cgroup সীমার তুলনায় ব্যবহৃত পড মেমরি\",\"pod_running_on\":\"Pod: চলছে, পোর্ট :\",\"pod_sick\":\"pod অসুস্থ\",\"pod_start_failed\":\"pod শুরু করা যায়নি\",\"pod_task_chip_one\":\"{{n}}টি টাস্ক\",\"pod_task_chip_other\":\"{{n}}টি টাস্ক\",\"pod_task_count\":\"পড টাস্ক (প্রসেস/থ্রেড) সংখ্যা\",\"pod_tasks\":\"টাস্ক: {{value}}\",\"pod_up\":\"pod চালু\",\"pod_up_name\":\"pod চালু: {{name}}\",\"pods_are_unavailable_on_this_host\":\"এই হোস্টে pod পাওয়া যাচ্ছে না।\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR বন্ধ — ব্রাঞ্চে নতুন কমিট আছে\",\"pr_closed_but_verification_unavailable_retry\":\"PR বন্ধ কিন্তু যাচাই করা যাচ্ছে না — আবার চেষ্টা করো\",\"pr_closed_not_on_main\":\"PR বন্ধ — main-এ নেই\",\"pr_closed_uncommitted_changes\":\"PR বন্ধ — কমিট না করা পরিবর্তন\",\"pr_merged\":\"PR মার্জ হয়েছে\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR মার্জ হয়েছে, কিন্তু মার্জের পরে নতুন কমিট পুশ হয়েছে\",\"pr_merged_but_verification_unavailable_retry\":\"PR মার্জ হয়েছে কিন্তু যাচাই করা যাচ্ছে না — আবার চেষ্টা করো\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR মার্জ হয়েছে — সরানো নিরাপদ। `git worktree remove` চালায়। এটি ফেরানো যাবে না।\",\"pr_merged_uncommitted_changes\":\"PR মার্জ হয়েছে, কমিট না করা পরিবর্তন আছে\",\"pr_open_or_unmerged_commits\":\"PR খোলা আছে বা মার্জ না হওয়া কমিট আছে\",\"pr_state_closed\":\"বন্ধ\",\"pr_state_merged\":\"মার্জ হয়েছে\",\"pr_state_open\":\"খোলা\",\"protected_worktree\":\"সুরক্ষিত — main বা বর্তমানে লাইভ\",\"provision\":\"প্রভিশন করুন\",\"provision_failed\":\"প্রভিশন ব্যর্থ\",\"provision_failed_exit_code\":\"প্রভিশন ব্যর্থ (exit {{code}})\",\"provision_failed_status\":\"প্রভিশন ব্যর্থ ({{status}})\",\"provision_failed_to_start\":\"প্রভিশন শুরু করা যায়নি\",\"provision_polling_timed_out_check_pod_logs\":\"প্রভিশন পোলিং টাইমআউট হয়েছে — pod-এর লগ দেখো\",\"provision_timed_out\":\"প্রভিশন টাইমআউট হয়েছে\",\"provisioned\":\"প্রভিশন করা হয়েছে\",\"provisioning\":\"প্রভিশন চলছে\",\"prune\":\"ছাঁটাই করুন\",\"prune_complete\":\"ছাঁটাই সম্পূর্ণ\",\"prune_failed_count_one\":\"ছাঁটাই: {{count}}টি ব্যর্থ\",\"prune_failed_count_other\":\"ছাঁটাই: {{count}}টি ব্যর্থ\",\"prune_failed_to_start\":\"ছাঁটাই শুরু করা যায়নি\",\"prune_merged\":\"মার্জ হওয়াগুলো ছাঁটাই করো\",\"prune_preview_failed\":\"ছাঁটাইয়ের প্রিভিউ ব্যর্থ\",\"prune_worktrees\":\"worktree ছাঁটাই করুন\",\"pruned_worktrees_one\":\"{{count}}টি worktree ছাঁটাই করা হয়েছে\",\"pruned_worktrees_other\":\"{{count}}টি worktree ছাঁটাই করা হয়েছে\",\"pruned_worktrees_some_failed_one\":\"{{count}}টি worktree ছাঁটাই করা হয়েছে ({{failed}}টি ব্যর্থ)\",\"pruned_worktrees_some_failed_other\":\"{{count}}টি worktree ছাঁটাই করা হয়েছে ({{failed}}টি ব্যর্থ)\",\"pruning_worktrees\":\"worktree ছাঁটাই করা হচ্ছে\",\"pull_build\":\"পুল + বিল্ড\",\"pull_build_2\":\"পুল+বিল্ড\",\"pull_build_failed\":\"পুল+বিল্ড ব্যর্থ হয়েছে\",\"pull_build_failed_exit_code_detail\":\"পুল+বিল্ড ব্যর্থ (exit {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"পুল+বিল্ড শুরু করা যায়নি\",\"pull_build_main\":\"main পুল + বিল্ড করুন\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"বেস ব্রাঞ্চ পুল করে আবার বিল্ড করে (~6 মিনিট)। রিস্টার্ট করে না।\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"বেস ব্রাঞ্চ টেনে বিল্ড করে (~6 মিনিট), তারপর স্বয়ংক্রিয়ভাবে গেটওয়ে পুনরায় চালু করে। বিল্ড শেষ না হওয়া পর্যন্ত এই পৃষ্ঠা খোলা রাখো।\",\"purpose\":\"উদ্দেশ্য:\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA pod চলছে কিন্তু হেলথ চেকে ব্যর্থ হচ্ছে\",\"qa_pod_is_running_click_open_to_use_it\":\"QA pod চলছে — ব্যবহার করতে 'খোলো'-তে ক্লিক করো\",\"qa_video\":\"QA + ভিডিও\",\"rebase\":\"Rebase\",\"rebase_conflicts\":\"রিবেস কনফ্লিক্ট\",\"rebase_failed\":\"রিবেস ব্যর্থ\",\"rebase_name\":\"“{{name}}” রিবেস করবে?\",\"rebase_onto_main\":\"বেস ব্রাঞ্চের উপর রিবেস করো\",\"rebased_head\":\"রিবেস হয়েছে (HEAD {{head}})\",\"refresh\":\"রিফ্রেশ\",\"refresh_fleet\":\"ফ্লিট রিফ্রেশ করুন\",\"remove\":\"সরান\",\"remove_closed_pr\":\"সরান — বন্ধ PR (main-এ নেই)\",\"remove_name\":\"“{{name}}” সরিয়ে ফেলবে?\",\"remove_selected\":\"নির্বাচিতগুলো সরান\",\"removed\":\"সরানো হয়েছে\",\"removed_name\":\"{{name}} সরিয়ে ফেলা হয়েছে\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"worktree সরিয়ে দেয় এবং pod বন্ধ করে দেয়। এটি ফেরানো যাবে না।\",\"removing\":\"সরানো হচ্ছে\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"লাইভ গেটওয়েকে এই worktree-এ ফিরিয়ে দাও (গেটওয়ে রিস্টার্ট হবে)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"লাইভ গেটওয়েকে আবার main-এ ফিরিয়ে দিন (গেটওয়ে রিস্টার্ট হবে)\",\"restart\":\"রিস্টার্ট\",\"restart_failed\":\"রিস্টার্ট ব্যর্থ\",\"restart_gateway\":\"গেটওয়ে রিস্টার্ট করুন\",\"restart_gateway_2\":\"গেটওয়ে রিস্টার্ট করবে?\",\"restart_gateway_to_apply_the_new_build\":\"নতুন বিল্ড প্রয়োগ করতে গেটওয়ে রিস্টার্ট করুন\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"pod রিস্টার্ট করো\",\"restarted_name\":\"{{name}} রিস্টার্ট হয়েছে\",\"restarting_completes_the_pending_cutover_boots\":\"রিস্টার্ট করলে মুলতুবি কাটওভার সম্পূর্ণ হবে: গেটওয়ে \\\"{{staged}}\\\"-এ ফিরে আসবে, বর্তমান চেকআউটে নয়। ড্যাশবোর্ড অল্প সময়ের জন্য বিচ্ছিন্ন হয়ে নিজে থেকে আবার সংযুক্ত হবে। ফিরিয়ে নিতে চাইলে স্টেজ করা কাটওভার বাতিল করো ব্যবহার করো।\",\"restarting_reconnecting\":\"রিস্টার্ট হচ্ছে — আবার কানেক্ট হচ্ছে…\",\"rows_count_one\":\"{{n}}টি সারি\",\"rows_count_other\":\"{{n}}টি সারি\",\"rows_filtered_count_one\":\"{{shown}} / {{n}}টি সারি\",\"rows_filtered_count_other\":\"{{shown}} / {{n}}টি সারি\",\"running_pods\":\"চলমান Pod\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"যেসব worktree-এর PR ইতিমধ্যে মার্জ হয়ে গেছে সেগুলো নিরাপদে সরিয়ে দেয়।\",\"scanning_merged\":\"মার্জ হওয়াগুলো স্ক্যান করা হচ্ছে…\",\"select\":\"{{name}} নির্বাচন করো\",\"sort_behind\":\"সাজান: পিছিয়ে\",\"sort_name\":\"সাজান: নাম\",\"sort_recent\":\"সাজান: সাম্প্রতিক\",\"sort_status\":\"সাজান: স্ট্যাটাস\",\"sort_worktrees\":\"worktree সাজান\",\"spin_up_pod\":\"pod চালু করো\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"আপনি `{{cmd}}` না চালানো পর্যন্ত ড্যাশবোর্ড বর্তমান সংস্করণ ব্যবহার করতে থাকবে। পুনরায় চালু হওয়ার পর একই URL ও ডেটা রেখে এটি “{{name}}” ব্যবহার করবে; এই পেজটি স্বয়ংক্রিয়ভাবে পুনরায় সংযুক্ত হবে না।\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"শুরু করো\",\"starting\":\"শুরু হচ্ছে…\",\"starting_pod_for_name_can_take_1_min\":\"{{name}}-এর জন্য pod চালু হচ্ছে… (~1 মিনিট লাগতে পারে)\",\"stop_pod\":\"pod বন্ধ করো\",\"stopped_name\":\"{{name}} বন্ধ করা হয়েছে\",\"stopping_pod\":\"পড থামানো হচ্ছে\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"লাইভ ড্যাশবোর্ডের পেছনের কোড এই worktree-এ বদলে দেয় (একই পোর্ট, একই ডেটা)। গেটওয়ে রিস্টার্ট হয় এবং এই পেজ নিজেই আবার কানেক্ট হয়। worktree প্রভিশন ও বিল্ড না থাকলে চলবে না।\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"ড্যাশবোর্ডকে আবার “{{name}}”-এ ফিরিয়ে নেয় (একই URL ও ডেটা)। ড্যাশবোর্ড অল্প সময়ের জন্য পুনরায় চালু হয় এবং এই পেজটি স্বয়ংক্রিয়ভাবে পুনরায় সংযুক্ত হয়।\",\"sync_progress\":\"সিঙ্ক অগ্রগতি\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"সিঙ্ক রান হারিয়ে গেছে (সিঙ্কের মাঝে গেটওয়ে রিস্টার্ট হয়েছে)। আবার পুল+বিল্ড চালাও।\",\"synced\":\"সিঙ্ক হয়েছে\",\"synced_restart_gateway_to_apply_the_new_build\":\"সিঙ্ক হয়েছে — নতুন বিল্ড প্রয়োগ করতে গেটওয়ে রিস্টার্ট করো।\",\"syncing\":\"সিঙ্ক হচ্ছে\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"এই পোর্টের লাইভ গেটওয়ে এই চেকআউট থেকে চলছে\",\"the_primary_checkout_is_on_branch_not_base\":\"প্রাথমিক চেকআউট {{branch}}-এ আছে, {{base}}-এ নয়। এটি {{base}}-এ ফিরিয়ে না আনা পর্যন্ত পুল + বিল্ড সিঙ্ক করতে অস্বীকার করবে।\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"যে প্রধান চেকআউট থেকে এই ফ্লিট খুঁজে পাওয়া যায়\",\"tickets\":\"টিকিট:\",\"toggle_log\":\"লগ দেখান/লুকান\",\"toggle_provision_log\":\"প্রভিশন লগ দেখান/লুকান\",\"token_mint_failed\":\"টোকেন তৈরি করা যায়নি\",\"total_disk_used_by_running_pod_homes\":\"চলমান পড হোম দ্বারা ব্যবহৃত মোট ডিস্ক\",\"uncommitted_changes\":\"কমিট না করা পরিবর্তন\",\"undo_make_live_failed\":\"ড্যাশবোর্ডকে আগের সংস্করণে ফেরানো যায়নি\",\"undo_to_name\":\"{{name}}-এ ফিরুন\",\"up_to_date_with_main\":\"main-এর সঙ্গে হালনাগাদ\",\"updated\":\"আপডেট হয়েছে\",\"verifying\":\"যাচাই করা হচ্ছে\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"নতুন গেটওয়ে প্রসেসের জন্য অপেক্ষা করা হচ্ছে। এটি চালু হলে পেজটি স্বয়ংক্রিয়ভাবে রিলোড হবে।\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktrees\",\"worktrees_count\":\"Worktrees ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"পূর্ববর্তী রিপোজিটরির নামে তৈরি worktree। ডিফল্টভাবে লুকানো; তবুও Prune merged এগুলো পরিষ্কার করে।\"}}")
	},
	de: {
		api: { "client": {
			"proxy_challenge_reload": "Lade diesen Browser-Tab neu — erscheint eine Anmeldeseite, ist die Sitzung deines Zugriffsproxys abgelaufen. Wenn nicht, hat ein Proxy oder eine Firewall vor diesem Dashboard die Anfrage abgewiesen; prüfe die Protokolle des Proxys oder versuche es später erneut.",
			"server_temporarily_unavailable_http_status": "Der Server ist vorübergehend nicht verfügbar (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_one": "{{app}} konnte {{count}}-mal in Folge nicht neu starten und versucht es weiterhin alle paar Minuten. Um es sofort erneut zu versuchen, deaktiviere {{app}} und aktiviere es wieder.",
				"restart_exhausted_message_other": "{{app}} konnte {{count}}-mal in Folge nicht neu starten und versucht es weiterhin alle paar Minuten. Um es sofort erneut zu versuchen, deaktiviere {{app}} und aktiviere es wieder.",
				"restart_exhausted_title": "{{app}} kann nicht neu gestartet werden"
			},
			"devFleet": { "manifest": {
				"configuration_1": "Verweise die App auf einen Checkout von Kiro Crew; PR-Aktionen benötigen ein authentifiziertes gh, Pods benötigen systemd --user unter Linux, launchd unter macOS oder die Aufgabenplanung unter Windows und müssen zuerst provisioniert werden.",
				"description": "Ein Steuerpult für die Arbeit an Kiro Crew selbst. Listet jeden Feature-Worktree mit dem Zustand seines Pull Requests, der Anzahl der Commits und dem Speicherverbrauch auf und kann jeden davon als Pod starten: eine vollständige Vorschauinstanz auf eigenem Port mit eigenem Datenverzeichnis, damit du eine unfertige Änderung durchklicken kannst, ohne dein laufendes Gateway zu stören. Es übernimmt auch die Nebenarbeiten — main pullen und neu bauen, einen Branch rebasen, Pod-Protokolle live mitlesen und Worktrees bereinigen, deren Arbeit schon gemergt ist.",
				"display_name": "Dev Fleet",
				"highlight_1": "Starte jeden Worktree als isolierten Pod auf eigenem Port und eigenem Datenverzeichnis, ohne dein laufendes Gateway anzutasten",
				"highlight_2": "Flottenansicht mit PR-Status pro Branch, Commit-Zahlen und Speicherverbrauch",
				"highlight_3": "Synchronisieren (main pullen und neu bauen) oder einen Branch rebasen, ohne das Dashboard zu verlassen",
				"highlight_4": "„Zusammengeführte bereinigen“ verweigert das Löschen eines Worktrees mit nicht committeter oder nicht verfolgter Arbeit, statt sie zu verwerfen",
				"highlight_5": "Pod-Protokolle live mitlesen und Pod-Zugriffstoken in der Benutzeroberfläche erzeugen",
				"highlight_6": "Für Leute gebaut, die Kiro Crew selbst entwickeln — für den Alltag nicht nötig",
				"highlight_7": "Pods laufen unter Linux (systemd --user), macOS (launchd) und Windows (Aufgabenplanung) — der macOS-Pod hat allerdings keine erzwungene Speicher-/CPU-Obergrenze; „Live schalten“ setzt den Zeiger auf jeder Plattform, ein automatischer Neustart braucht eine systemd --user-Unit oder einen macOS-LaunchAgent; Flottenansicht, PR-Status, Synchronisieren, Rebasen und Bereinigen funktionieren auf jeder Plattform",
				"page_label": "Dev Fleet",
				"use_case_1": "Verwalte Kiro-Crew-Feature-Worktrees und isolierte Vorschau-Pods, ohne das Live-Gateway zu verändern."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"Aktionen\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"Wendet den letzten Pull+Build an. Das Dashboard trennt sich kurz und verbindet sich von selbst wieder.\",\"backend_unavailable\":\"Backend nicht verfügbar\",\"behind\":\"Zurück\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"startet jeden Worktree als\\n              isoliertes Einweg-Gateway, damit Sie einen Feature-Branch prüfen können, ohne Ihre Live-Instanz zu berühren.\",\"branch\":\"Branch:\",\"build_finished_restarting_gateway\":\"Build abgeschlossen — Gateway wird neu gestartet…\",\"build_pending\":\"Build ausstehend\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"Build ausstehend — Gateway neu starten zum Anwenden (kirocrew restart)\",\"building\":\"Build läuft…\",\"built\":\"gebaut\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"Gebaut und bereit — starte über das Zeilenmenü einen Pod, um diesen Branch zu testen\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"Gebaut — aber auf diesem Host können keine Pods laufen; nutze stattdessen ./dev-backend.sh für die Vorschau\",\"cancel\":\"Abbrechen\",\"cancel_staged_cutover\":\"Vorgemerkte Umschaltung abbrechen\",\"cancel_staged_cutover_2\":\"Vorgemerkte Umschaltung abbrechen?\",\"cannot_remove_the_main_worktree\":\"Der Haupt-Worktree kann nicht entfernt werden\",\"cannot_resolve_worktree_path_for_name\":\"Der Worktree-Pfad für {{name}} kann nicht aufgelöst werden\",\"close\":\"Schließen\",\"closed_has_unmerged_commits\":\"Geschlossener PR — enthält Commits, die nicht in main sind\",\"closed_pr_not_on_main_hint\":\"Geschlossener, nicht gemergter PR — sein Inhalt ist nicht in main, das Entfernen löscht ihn dauerhaft. Vor dem Auswählen prüfen.\",\"collapse\":\"Einklappen\",\"commits\":\"Commits:\",\"commits_behind_main\":\"Commits hinter main\",\"commits_behind_main_2_one\":\"{{count}} Commit hinter main\",\"commits_behind_main_2_other\":\"{{count}} Commits hinter main\",\"confirm\":\"Bestätigen\",\"conflicts_aborted\":\"Konflikte — abgebrochen\",\"created_recently\":\"kürzlich erstellt\",\"current_step\":\"aktueller Schritt\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"Umschaltung vorgemerkt: dieser Worktree wird beim nächsten Start des Gateways live. Führen Sie `{{cmd}}` aus, um sie abzuschließen, oder nutzen Sie das Menü dieser Zeile → Vorgemerkte Umschaltung abbrechen, um sie zurückzunehmen. Bis dahin führt das Gateway weiterhin den vorherigen Checkout aus.\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"Trotzdem löschen\",\"design_docs\":\"Design-Dokumente:\",\"dev_fleet\":\"Dev Fleet\",\"discard_untracked_files\":\"Verwirft außerdem nicht verfolgte Dateien ({{count}}), darunter: {{files}}\",\"discovery_error\":\"Fehler bei der Erkennung\",\"disk\":\"Datenträger:\",\"disk_usage_unavailable\":\"Speicherbelegung nicht verfügbar\",\"disk_worktrees\":\"Datenträger (Worktrees)\",\"dismiss\":\"Schließen\",\"dismiss_sync_status\":\"Synchronisierungsstatus schließen\",\"each_row_below_is_a_git_worktree_discovered_from\":\"Jede Zeile unten ist ein Git-Worktree, der aus dem Haupt-Checkout erkannt wurde. Verwenden Sie\",\"empty_worktree_cannot_be_undone\":\"Leerer Worktree. Kann nicht rückgängig gemacht werden.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"Jeder Git-Worktree des Haupt-Checkouts. Pull+Build synchronisiert main; Pods sind isolierte Gateways, die aus einem Worktree gestartet werden.\",\"expand\":\"Ausklappen\",\"failed\":\"Fehlgeschlagen\",\"failed_to_load_logs\":\"Protokolle konnten nicht geladen werden\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"Holt das neueste main und spielt die Commits neu ein. Wird bei ungesicherten Änderungen verweigert; bei Konflikten wird der Rebase abgebrochen.\",\"filter_worktrees\":\"Worktrees filtern…\",\"filter_worktrees_2\":\"Worktrees filtern\",\"finished\":\"Abgeschlossen\",\"force_remove\":\"{{name}} erzwungen entfernen\",\"force_remove_confirm_desc_one\":\"{{count}} Worktree hat nicht zusammengeführte oder nicht committete Änderungen. Das Entfernen löscht alle lokalen Änderungen dauerhaft. Dies kann nicht rückgängig gemacht werden.\",\"force_remove_confirm_desc_other\":\"{{count}} Worktrees haben nicht zusammengeführte oder nicht committete Änderungen. Das Entfernen löscht alle lokalen Änderungen dauerhaft. Dies kann nicht rückgängig gemacht werden.\",\"force_remove_confirm_title\":\"Worktrees zwangsweise entfernen?\",\"force_remove_warning\":\"Ausgewählte Worktrees haben nicht zusammengeführte Änderungen — das Entfernen ist dauerhaft und kann nicht rückgängig gemacht werden.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"Gateway ist nicht innerhalb von 60 s zurückgekehrt — lade die Seite manuell neu oder prüfe `kirocrew logs`.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"Gateway wurde mitten in der Synchronisierung neu gestartet — Ausführung verloren; Git-Status prüfen und Pull+Build erneut ausführen\",\"git_status_failed\":\"git status fehlgeschlagen\",\"has_unmerged_work_removing_deletes_permanently\":\"Enthält nicht zusammengeführte Arbeit — Entfernen LÖSCHT sie endgültig.\",\"hide_legacy_worktrees\":\"{{n}} veraltete Worktrees ausblenden\",\"hide_logs\":\"Protokolle ausblenden\",\"issues\":\"Issues:\",\"keep_cutover\":\"Umschaltung behalten\",\"keeps_name_the_live_target_and_discards_the_stag\":\"„{{name}}“ bleibt das Live-Ziel, die vorgemerkte Umschaltung auf „{{staged}}“ wird verworfen. Nichts wird neu gestartet — das Gateway führt weiterhin den aktuellen Code aus.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"Der laufende Checkout bleibt das Live-Ziel, die vorgemerkte Umschaltung auf {{staged}} wird verworfen (nichts wird neu gestartet)\",\"keeps_this_checkout_the_live_target_and_discards\":\"Dieser Checkout bleibt das Live-Ziel, die vorgemerkte Umschaltung auf „{{staged}}“ wird verworfen (nichts wird neu gestartet)\",\"kept\":\"Behalten\",\"kept_discard_untracked_hint\":\"Zeilen, die nur durch nicht verfolgten Scratch aufgehalten werden: Ankreuzen einer verwirft die in dieser Zeile aufgeführten Dateien.\",\"kept_force_hint\":\"Ankreuzen zum erzwungenen Entfernen — löscht nicht zusammengeführte Arbeit.\",\"last_commit_activity\":\"Letzte Commit-Aktivität\",\"legacy_worktrees_hidden_show\":\"{{n}} veraltete Worktrees ausgeblendet · Anzeigen\",\"live\":\"live\",\"live_checkout_changed_to_name\":\"Das Dashboard verwendet jetzt „{{name}}“.\",\"live_state_unknown\":\"Live-Status nicht verfügbar\",\"live_state_unknown_help\":\"Das Gateway konnte nicht melden, welcher Checkout live (der Checkout, aus dem das Gateway selbst läuft) oder vorgemerkt ist; deshalb ist keine Zeile als live markiert — der Zustand ist unbekannt, nicht leer. Frag den Agenten, bevor du einen Checkout live schaltest.\",\"live_unverified\":\"live?\",\"load_pod_logs\":\"Pod-Protokolle laden\",\"loading\":\"Wird geladen…\",\"log\":\"Protokoll ▴\",\"log_2\":\"Protokoll ▾\",\"main\":\"· main\",\"make_live\":\"Live schalten\",\"make_live_failed\":\"Live schalten fehlgeschlagen\",\"make_name_live\":\"„{{name}}“ live schalten?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"Die Git-Worktrees Ihres Haupt-Checkouts verwalten — Synchronisieren, Rebasen, QA-Pods und Aufräumen an einem Ort.\",\"marked_live_but_this_install_cant_confirm_it\":\"Paketierte Installation: Nicht bestätigt, dass dieser Checkout läuft.\",\"more_actions\":\"Weitere Aktionen\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"verschiebt einen Feature-Branch auf das neueste main, und\",\"needs_provision\":\"Benötigt Bereitstellung\",\"no_candidates_found\":\"Keine Kandidaten gefunden.\",\"no_checkout_found\":\"Kein {{productName}}-Checkout gefunden\",\"no_checkout_found_action\":\"Füge dev_fleet.repo_path zur config.json in deinem {{productName}}-Datenverzeichnis hinzu (standardmäßig ~/.kiro/crew), und diese Seite übernimmt den Pfad beim nächsten Aktualisieren. Die Umgebungsvariable unten funktioniert auch, aber ein laufendes Gateway sieht eine erst danach gesetzte Variable nicht, deshalb ist dafür ein Neustart nötig.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/pfad/zu/deinem/checkout\",\"no_checkout_found_help\":\"Dev Fleet verwaltet die Git-Worktrees eines {{productName}}-Quell-Checkouts. In deinem Projektverzeichnis, im Checkout, das dieses Dashboard bereitstellt, und an den üblichen Klon-Speicherorten wurde keines gefunden.\",\"no_commits_stale\":\"keine Commits, veraltet\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"Noch kein venv-/UI-Build — „Bereitstellen“ baut diesen Worktree, damit ein Pod laufen kann\",\"no_worktrees_found\":\"Keine Worktrees gefunden\",\"not_built\":\"nicht gebaut\",\"nothing_selected\":\"Nichts ausgewählt\",\"nothing_to_prune\":\"Nichts zu bereinigen\",\"nothing_under_the_worktrees_root_yet\":\"Noch nichts unter dem Worktrees-Wurzelverzeichnis.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"in der main-Zeile, um es von origin vorzuspulen und neu zu bauen\\n              (starten Sie dann das Gateway neu, um es anzuwenden).\",\"open\":\"Öffnen\",\"orphan_pods_label\":\"Verwaiste Pod-Homes: {{value}}\",\"parked_on_branch\":\"Auf {{branch}} geparkt\",\"pending\":\"Ausstehend\",\"pod\":\"Pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"Pod- und „Live schalten“-Aktionen sind ausgeblendet; alles andere auf dieser Seite funktioniert normal.\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"Pod-CPU-Auslastung\",\"pod_home_disk\":\"Pod-Home-Speicher: {{value}}\",\"pod_home_size\":\"Pod-Home: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"Pod-Homes auf der Festplatte ohne aktiven Pod\",\"pod_memory\":\"Speicher: {{value}}\",\"pod_memory_of_ceiling\":\"Genutzter Pod-Speicher im Verhältnis zum cgroup-Limit\",\"pod_running_on\":\"Pod: läuft auf :\",\"pod_sick\":\"Pod fehlerhaft\",\"pod_start_failed\":\"Pod-Start fehlgeschlagen\",\"pod_task_chip_one\":\"{{n}} Task\",\"pod_task_chip_other\":\"{{n}} Tasks\",\"pod_task_count\":\"Anzahl der Pod-Tasks (Prozesse/Threads)\",\"pod_tasks\":\"Tasks: {{value}}\",\"pod_up\":\"pod up\",\"pod_up_name\":\"Pod gestartet: {{name}}\",\"pods_are_unavailable_on_this_host\":\"Pods sind auf diesem Host nicht verfügbar.\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR geschlossen — Branch hat neuere Commits\",\"pr_closed_but_verification_unavailable_retry\":\"PR geschlossen, aber Überprüfung nicht verfügbar — erneut versuchen\",\"pr_closed_not_on_main\":\"PR geschlossen — nicht in main\",\"pr_closed_uncommitted_changes\":\"PR geschlossen — nicht committete Änderungen\",\"pr_merged\":\"PR zusammengeführt\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR zusammengeführt, aber nach dem Merge neue Commits gepusht\",\"pr_merged_but_verification_unavailable_retry\":\"PR zusammengeführt, aber Überprüfung nicht verfügbar — erneut versuchen\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR zusammengeführt — Entfernen ist sicher. Führt `git worktree remove` aus. Kann nicht rückgängig gemacht werden.\",\"pr_merged_uncommitted_changes\":\"PR zusammengeführt, nicht committete Änderungen\",\"pr_open_or_unmerged_commits\":\"PR offen oder nicht zusammengeführte Commits\",\"pr_state_closed\":\"geschlossen\",\"pr_state_merged\":\"gemergt\",\"pr_state_open\":\"offen\",\"protected_worktree\":\"Geschützt — Haupt-Worktree oder aktuell live\",\"provision\":\"Bereitstellen\",\"provision_failed\":\"Bereitstellung fehlgeschlagen\",\"provision_failed_exit_code\":\"Bereitstellung fehlgeschlagen (Exit {{code}})\",\"provision_failed_status\":\"Bereitstellung fehlgeschlagen ({{status}})\",\"provision_failed_to_start\":\"Bereitstellung konnte nicht gestartet werden\",\"provision_polling_timed_out_check_pod_logs\":\"Zeitüberschreitung beim Abfragen der Bereitstellung — Pod-Protokolle prüfen\",\"provision_timed_out\":\"Zeitüberschreitung bei der Bereitstellung\",\"provisioned\":\"Bereitgestellt\",\"provisioning\":\"Bereitstellung\",\"prune\":\"Bereinigen\",\"prune_complete\":\"Bereinigung abgeschlossen\",\"prune_failed_count_one\":\"Bereinigen: {{count}} fehlgeschlagen\",\"prune_failed_count_other\":\"Bereinigen: {{count}} fehlgeschlagen\",\"prune_failed_to_start\":\"Bereinigung konnte nicht gestartet werden\",\"prune_merged\":\"Zusammengeführte bereinigen\",\"prune_preview_failed\":\"Vorschau der Bereinigung fehlgeschlagen\",\"prune_worktrees\":\"Worktrees bereinigen\",\"pruned_worktrees_one\":\"{{count}} Worktree bereinigt\",\"pruned_worktrees_other\":\"{{count}} Worktrees bereinigt\",\"pruned_worktrees_some_failed_one\":\"{{count}} Worktree bereinigt ({{failed}} fehlgeschlagen)\",\"pruned_worktrees_some_failed_other\":\"{{count}} Worktrees bereinigt ({{failed}} fehlgeschlagen)\",\"pruning_worktrees\":\"Worktrees werden bereinigt\",\"pull_build\":\"Pull + Build\",\"pull_build_2\":\"Pull+Build\",\"pull_build_failed\":\"Pull+Build fehlgeschlagen\",\"pull_build_failed_exit_code_detail\":\"Pull+Build fehlgeschlagen (Exit {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"Pull+Build konnte nicht gestartet werden\",\"pull_build_main\":\"Pull + Build von main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"Holt den Basis-Branch und baut neu (~6 Min.). Startet NICHT neu.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"Holt den Basis-Branch, baut neu (~6 Min.) und startet das Gateway automatisch neu. Lass diese Seite geöffnet, bis der Build fertig ist.\",\"purpose\":\"Zweck:\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA-Pod läuft, besteht aber seine Zustandsprüfung nicht\",\"qa_pod_is_running_click_open_to_use_it\":\"QA-Pod läuft — auf „Öffnen“ klicken, um ihn zu nutzen\",\"qa_video\":\"QA + Video\",\"rebase\":\"Rebase\",\"rebase_conflicts\":\"Rebase-Konflikte\",\"rebase_failed\":\"Rebase fehlgeschlagen\",\"rebase_name\":\"„{{name}}“ rebasen?\",\"rebase_onto_main\":\"Rebase auf den Basis-Branch\",\"rebased_head\":\"Rebasiert (HEAD {{head}})\",\"refresh\":\"Aktualisieren\",\"refresh_fleet\":\"Fleet aktualisieren\",\"remove\":\"Entfernen\",\"remove_closed_pr\":\"Entfernen — geschlossener PR (nicht in main)\",\"remove_name\":\"„{{name}}“ entfernen?\",\"remove_selected\":\"Ausgewählte entfernen\",\"removed\":\"Entfernt\",\"removed_name\":\"{{name}} entfernt\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"Entfernt Worktrees und stoppt Pods. Kann nicht rückgängig gemacht werden.\",\"removing\":\"Wird entfernt\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"Das Live-Gateway auf diesen Worktree umstellen (startet das Gateway neu)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"Das Live-Gateway wieder auf main umstellen (startet das Gateway neu)\",\"restart\":\"Neu starten\",\"restart_failed\":\"Neustart fehlgeschlagen\",\"restart_gateway\":\"Gateway neu starten\",\"restart_gateway_2\":\"Gateway neu starten?\",\"restart_gateway_to_apply_the_new_build\":\"Gateway neu starten, um den neuen Build anzuwenden\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"Pod neu starten\",\"restarted_name\":\"{{name}} neu gestartet\",\"restarting_completes_the_pending_cutover_boots\":\"Ein Neustart schließt die ausstehende Umschaltung ab: das Gateway startet mit „{{staged}}“, nicht mit dem aktuellen Checkout. Das Dashboard trennt kurz die Verbindung und verbindet sich automatisch neu. Zum Zurücknehmen stattdessen Vorgemerkte Umschaltung abbrechen verwenden.\",\"restarting_reconnecting\":\"Neustart — neu verbinden…\",\"rows_count_one\":\"{{n}} Zeile\",\"rows_count_other\":\"{{n}} Zeilen\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} Zeile\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} Zeilen\",\"running_pods\":\"Laufende Pods\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"entfernt sicher Worktrees, deren PR bereits zusammengeführt wurde.\",\"scanning_merged\":\"Suche nach Zusammengeführten…\",\"select\":\"{{name}} auswählen\",\"sort_behind\":\"Sortierung: zurück\",\"sort_name\":\"Sortierung: Name\",\"sort_recent\":\"Sortierung: kürzlich\",\"sort_status\":\"Sortierung: Status\",\"sort_worktrees\":\"Worktrees sortieren\",\"spin_up_pod\":\"Pod starten\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"Das Dashboard verwendet die aktuelle Version weiter, bis du `{{cmd}}` ausführst. Nach dem Neustart verwendet es „{{name}}“ mit derselben URL und denselben Daten; diese Seite verbindet sich nicht automatisch erneut.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"Starten\",\"starting\":\"wird gestartet…\",\"starting_pod_for_name_can_take_1_min\":\"Pod für {{name}} wird gestartet… (kann ~1 Min. dauern)\",\"stop_pod\":\"Pod stoppen\",\"stopped_name\":\"{{name}} gestoppt\",\"stopping_pod\":\"Pod wird gestoppt\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"Tauscht den Code hinter dem Live-Dashboard gegen diesen Worktree (gleicher Port, gleiche Daten). Das Gateway startet neu und diese Seite verbindet sich automatisch wieder. Wird nur zugelassen, wenn der Worktree bereitgestellt und gebaut ist.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"Stellt das Dashboard auf „{{name}}“ zurück (gleiche URL und gleiche Daten). Das Dashboard startet kurz neu und diese Seite verbindet sich automatisch erneut.\",\"sync_progress\":\"Synchronisierungsfortschritt\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"Synchronisierungslauf verloren (Gateway wurde mitten in der Synchronisierung neu gestartet). Pull+Build erneut ausführen.\",\"synced\":\"Synchronisiert\",\"synced_restart_gateway_to_apply_the_new_build\":\"Synchronisiert — Gateway neu starten, um den neuen Build anzuwenden.\",\"syncing\":\"Wird synchronisiert\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"Das Live-Gateway auf diesem Port läuft aus diesem Checkout\",\"the_primary_checkout_is_on_branch_not_base\":\"Der primäre Checkout ist auf {{branch}}, nicht auf {{base}}. Pull + Build verweigert die Synchronisierung, bis er zurück auf {{base}} gewechselt wird.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"Der primäre Checkout, aus dem diese Fleet erkannt wird\",\"tickets\":\"Tickets:\",\"toggle_log\":\"Protokoll umschalten\",\"toggle_provision_log\":\"Bereitstellungsprotokoll umschalten\",\"token_mint_failed\":\"Token-Erstellung fehlgeschlagen\",\"total_disk_used_by_running_pod_homes\":\"Gesamter von laufenden Pod-Homes genutzter Speicher\",\"uncommitted_changes\":\"nicht committete Änderungen\",\"undo_make_live_failed\":\"Das Dashboard konnte nicht zurückgesetzt werden\",\"undo_to_name\":\"Zu {{name}} zurückkehren\",\"up_to_date_with_main\":\"auf dem Stand von main\",\"updated\":\"Aktualisiert\",\"verifying\":\"Wird überprüft\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"Warten auf den neuen Gateway-Prozess. Die Seite wird automatisch neu geladen, sobald er läuft.\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktrees\",\"worktrees_count\":\"Worktrees ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"Worktrees, die unter einem früheren Repository-Namen erstellt wurden. Standardmäßig ausgeblendet; werden weiterhin von „Zusammengeführte bereinigen“ abgedeckt.\"}}")
	},
	en: {
		api: { "client": {
			"proxy_challenge_reload": "Reload this browser tab — if a sign-in page appears, your access proxy’s session expired. If not, a proxy or firewall in front of this dashboard refused the request; check the proxy’s logs, or retry later.",
			"server_temporarily_unavailable_http_status": "The server is temporarily unavailable (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_one": "{{app}} has failed to restart {{count}} time in a row and will keep retrying every few minutes. To retry now, disable and re-enable {{app}}.",
				"restart_exhausted_message_other": "{{app}} has failed to restart {{count}} times in a row and will keep retrying every few minutes. To retry now, disable and re-enable {{app}}.",
				"restart_exhausted_title": "{{app}} keeps failing to restart"
			},
			"devFleet": { "manifest": {
				"configuration_1": "Point the app at a Kiro Crew checkout; PR actions need authenticated gh, while pods need systemd --user on Linux, launchd on macOS or Task Scheduler on Windows and must be provisioned first.",
				"description": "A control panel for working on Kiro Crew itself. Lists every feature worktree alongside its pull request state, commit count, and disk usage, and can bring any of them up as a pod: a complete preview instance on its own port with its own data directory, so you can click through an unfinished change without disturbing your live gateway. It also handles the chores around that — pulling main and rebuilding, rebasing a branch, streaming pod logs, and pruning worktrees whose work has already merged. Enabling it also lets AGENT sessions start and stop pods through the pod tools, which means code from a worktree an agent can write runs outside the agent's sandbox, as you.",
				"display_name": "Dev Fleet",
				"highlight_1": "Bring up any worktree as an isolated pod on its own port and data directory, leaving your live gateway untouched",
				"highlight_2": "Fleet view with per-branch PR status, commit counts, and disk usage",
				"highlight_3": "Sync (pull main and rebuild) or rebase a branch without leaving the dashboard",
				"highlight_4": "'Prune merged' refuses to delete a worktree with uncommitted or untracked work rather than discarding it",
				"highlight_5": "Stream pod logs and mint pod access tokens from the UI",
				"highlight_6": "Built for people developing Kiro Crew itself — not needed for everyday use",
				"highlight_7": "Pods run on Linux (systemd --user), macOS (launchd) and Windows (Task Scheduler) — but the macOS pod has no enforced memory/CPU ceiling; Make Live stages its pointer on every platform, and automatic restart needs a systemd --user unit or a macOS LaunchAgent; the fleet view, PR status, sync, rebase and prune work on any platform",
				"page_label": "Dev Fleet",
				"use_case_1": "Operate Kiro Crew feature worktrees and isolated preview pods while keeping the live gateway untouched."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"Actions\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"Applies the last Pull+Build. The dashboard will briefly disconnect and reconnect on its own.\",\"backend_unavailable\":\"Backend unavailable\",\"behind\":\"Behind\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"boots any worktree as an\\n              isolated throwaway gateway so you can QA a feature branch without touching your live instance.\",\"branch\":\"Branch:\",\"build_finished_restarting_gateway\":\"Build finished — restarting the gateway…\",\"build_pending\":\"build pending\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"build pending — restart gateway to apply (kirocrew restart)\",\"building\":\"Building…\",\"built\":\"built\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"Built and ready — spin up a pod from the row menu to QA this branch\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"Built — but pods cannot run on this host; preview it with ./dev-backend.sh instead\",\"cancel\":\"Cancel\",\"cancel_staged_cutover\":\"Cancel staged cutover\",\"cancel_staged_cutover_2\":\"Cancel staged cutover?\",\"cannot_remove_the_main_worktree\":\"Cannot remove the main worktree\",\"cannot_resolve_worktree_path_for_name\":\"Cannot resolve worktree path for {{name}}\",\"close\":\"Close\",\"closed_has_unmerged_commits\":\"closed PR — has commits not on main\",\"closed_pr_not_on_main_hint\":\"Closed, unmerged PR — content is not on main, so removing one deletes it permanently. Review before selecting.\",\"collapse\":\"Collapse\",\"commits\":\"Commits:\",\"commits_behind_main\":\"Commits behind main\",\"commits_behind_main_2_one\":\"{{count}} commit behind main\",\"commits_behind_main_2_other\":\"{{count}} commits behind main\",\"confirm\":\"Confirm\",\"conflicts_aborted\":\"Conflicts — aborted\",\"created_recently\":\"created recently\",\"current_step\":\"current step\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it, or use this row’s menu → Cancel staged cutover to back out. The gateway is still running the previous checkout until then.\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"Delete anyway\",\"design_docs\":\"Design docs:\",\"dev_fleet\":\"Dev Fleet\",\"discard_untracked_files\":\"Also discards untracked files ({{count}}), including: {{files}}\",\"discovery_error\":\"Discovery Error\",\"disk\":\"Disk:\",\"disk_usage_unavailable\":\"Disk usage unavailable\",\"disk_worktrees\":\"Disk (worktrees)\",\"dismiss\":\"Dismiss\",\"dismiss_sync_status\":\"Dismiss sync status\",\"each_row_below_is_a_git_worktree_discovered_from\":\"Each row below is a git worktree discovered from the main checkout. Use\",\"empty_worktree_cannot_be_undone\":\"Empty worktree. Cannot be undone.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"Every git worktree of the main checkout. Pull+Build syncs main; pods are isolated gateways booted from a worktree.\",\"expand\":\"Expand\",\"failed\":\"Failed\",\"failed_to_load_logs\":\"Failed to load logs\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"Fetches latest main and replays. Refused if dirty; on conflict rebase is aborted.\",\"filter_worktrees\":\"Filter worktrees…\",\"filter_worktrees_2\":\"Filter worktrees\",\"finished\":\"Finished\",\"force_remove\":\"Force remove {{name}}\",\"force_remove_confirm_desc_one\":\"{{count}} worktree has unmerged or uncommitted work. Removing it permanently deletes all local changes. This cannot be undone.\",\"force_remove_confirm_desc_other\":\"{{count}} worktrees have unmerged or uncommitted work. Removing them permanently deletes all local changes. This cannot be undone.\",\"force_remove_confirm_title\":\"Force remove worktrees?\",\"force_remove_warning\":\"Selected worktrees have unmerged work — removal is permanent and cannot be undone.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"Gateway did not come back within 60s — reload the page manually, or check `kirocrew logs`.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"gateway restarted mid-sync — run lost; check git state and re-run Pull+Build\",\"git_status_failed\":\"git status failed\",\"has_unmerged_work_removing_deletes_permanently\":\"Has unmerged work — removing DELETES permanently.\",\"hide_legacy_worktrees\":\"Hide {{n}} legacy worktrees\",\"hide_logs\":\"Hide logs\",\"issues\":\"Issues:\",\"keep_cutover\":\"Keep cutover\",\"keeps_name_the_live_target_and_discards_the_stag\":\"Keeps “{{name}}” as the live target and discards the staged switch to “{{staged}}”. Nothing restarts — the gateway keeps running the code it is running now.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"Keeps the live checkout as the live target and discards the staged switch to {{staged}} (nothing restarts)\",\"keeps_this_checkout_the_live_target_and_discards\":\"Keeps this checkout the live target and discards the staged switch to “{{staged}}” (nothing restarts)\",\"kept\":\"Kept\",\"kept_discard_untracked_hint\":\"Rows held up only by untracked scratch: checking one discards the files listed on that row.\",\"kept_force_hint\":\"Check to force remove — deletes unmerged work.\",\"last_commit_activity\":\"Last commit activity\",\"legacy_worktrees_hidden_show\":\"{{n}} legacy worktrees hidden · Show\",\"live\":\"live\",\"live_checkout_changed_to_name\":\"The dashboard is now using “{{name}}”.\",\"live_state_unknown\":\"Live state unavailable\",\"live_state_unknown_help\":\"The gateway couldn't report which checkout is live (the checkout the gateway itself runs from) or staged, so no row is marked live — this is unknown, not empty. Ask the agent before making a checkout live.\",\"live_unverified\":\"live?\",\"load_pod_logs\":\"Load pod logs\",\"loading\":\"Loading…\",\"log\":\"log ▴\",\"log_2\":\"log ▾\",\"main\":\"· main\",\"make_live\":\"Make live\",\"make_live_failed\":\"Make live failed\",\"make_name_live\":\"Make “{{name}}” live?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"Manage the git worktrees of your main checkout — sync, rebase, QA pods, and cleanup in one place.\",\"marked_live_but_this_install_cant_confirm_it\":\"Packaged install: can't confirm this checkout is running.\",\"more_actions\":\"More actions\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"moves a feature branch onto the latest main, and\",\"needs_provision\":\"Needs provision\",\"no_candidates_found\":\"No candidates found.\",\"no_checkout_found\":\"No {{productName}} checkout found\",\"no_checkout_found_action\":\"Add dev_fleet.repo_path to config.json in your {{productName}} data directory (~/.kiro/crew by default), and this page picks it up on its next refresh. The environment variable below works too, but a running gateway cannot see a variable set after it started, so that route needs a restart.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/path/to/your/checkout\",\"no_checkout_found_help\":\"Dev Fleet manages the git worktrees of a {{productName}} source checkout. None was found in your project directory, in the checkout serving this dashboard, or in the usual clone locations.\",\"no_commits_stale\":\"no commits, stale\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"No venv/UI build yet — Provision builds this worktree so a pod can run\",\"no_worktrees_found\":\"No worktrees found\",\"not_built\":\"not built\",\"nothing_selected\":\"Nothing selected\",\"nothing_to_prune\":\"Nothing to prune\",\"nothing_under_the_worktrees_root_yet\":\"Nothing under the worktrees root yet.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"on the main row to fast-forward it from origin and rebuild\\n              (then restart the gateway to apply).\",\"open\":\"Open\",\"orphan_pods_label\":\"Orphan pod homes: {{value}}\",\"parked_on_branch\":\"Parked on {{branch}}\",\"pending\":\"Pending\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"Pod actions are hidden; everything else on this page works normally.\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"Pod CPU usage\",\"pod_home_disk\":\"Pod-home disk: {{value}}\",\"pod_home_size\":\"Pod home: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"Pod homes left on disk with no live pod\",\"pod_memory\":\"Memory: {{value}}\",\"pod_memory_of_ceiling\":\"Pod memory used against its cgroup ceiling\",\"pod_running_on\":\"Pod: running on :\",\"pod_sick\":\"pod sick\",\"pod_start_failed\":\"Pod start failed\",\"pod_task_chip_one\":\"{{n}} task\",\"pod_task_chip_other\":\"{{n}} tasks\",\"pod_task_count\":\"Pod task (process/thread) count\",\"pod_tasks\":\"Tasks: {{value}}\",\"pod_up\":\"pod up\",\"pod_up_name\":\"Pod up: {{name}}\",\"pods_are_unavailable_on_this_host\":\"Pods are unavailable on this host.\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR closed — branch has newer commits\",\"pr_closed_but_verification_unavailable_retry\":\"PR closed but verification unavailable — retry\",\"pr_closed_not_on_main\":\"PR closed — not on main\",\"pr_closed_uncommitted_changes\":\"PR closed — uncommitted changes\",\"pr_merged\":\"PR merged\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR merged but new commits pushed after merge\",\"pr_merged_but_verification_unavailable_retry\":\"PR merged but verification unavailable — retry\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR merged — safe to remove. Runs `git worktree remove`. Cannot be undone.\",\"pr_merged_uncommitted_changes\":\"PR merged, uncommitted changes\",\"pr_open_or_unmerged_commits\":\"PR open or unmerged commits\",\"pr_state_closed\":\"closed\",\"pr_state_merged\":\"merged\",\"pr_state_open\":\"open\",\"protected_worktree\":\"Protected — main or currently live\",\"provision\":\"Provision\",\"provision_failed\":\"Provision failed\",\"provision_failed_exit_code\":\"Provision failed (exit {{code}})\",\"provision_failed_status\":\"Provision failed ({{status}})\",\"provision_failed_to_start\":\"Provision failed to start\",\"provision_polling_timed_out_check_pod_logs\":\"Provision polling timed out — check pod logs\",\"provision_timed_out\":\"Provision timed out\",\"provisioned\":\"Provisioned\",\"provisioning\":\"Provisioning\",\"prune\":\"Prune\",\"prune_complete\":\"Prune complete\",\"prune_failed_count_one\":\"Prune: {{count}} failed\",\"prune_failed_count_other\":\"Prune: {{count}} failed\",\"prune_failed_to_start\":\"Prune failed to start\",\"prune_merged\":\"Prune merged\",\"prune_preview_failed\":\"Prune preview failed\",\"prune_worktrees\":\"Prune worktrees\",\"pruned_worktrees_one\":\"Pruned {{count}} worktree\",\"pruned_worktrees_other\":\"Pruned {{count}} worktrees\",\"pruned_worktrees_some_failed_one\":\"Pruned {{count}} worktree ({{failed}} failed)\",\"pruned_worktrees_some_failed_other\":\"Pruned {{count}} worktrees ({{failed}} failed)\",\"pruning_worktrees\":\"Pruning worktrees\",\"pull_build\":\"Pull + Build\",\"pull_build_2\":\"Pull+Build\",\"pull_build_failed\":\"Pull+Build failed\",\"pull_build_failed_exit_code_detail\":\"Pull+Build failed (exit {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"Pull+Build failed to start\",\"pull_build_main\":\"Pull + Build main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"Pulls the base branch and rebuilds (~6 min). Does NOT restart.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"Pulls the base branch, rebuilds (~6 min), then restarts the gateway automatically. Keep this page open until the build finishes.\",\"purpose\":\"Purpose:\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA pod is running but failing its health check\",\"qa_pod_is_running_click_open_to_use_it\":\"QA pod is running — click Open to use it\",\"qa_video\":\"QA + video\",\"rebase\":\"Rebase\",\"rebase_conflicts\":\"Rebase conflicts\",\"rebase_failed\":\"Rebase failed\",\"rebase_name\":\"Rebase “{{name}}”?\",\"rebase_onto_main\":\"Rebase onto base branch\",\"rebased_head\":\"Rebased (HEAD {{head}})\",\"refresh\":\"Refresh\",\"refresh_fleet\":\"Refresh fleet\",\"remove\":\"Remove\",\"remove_closed_pr\":\"Remove — closed PR (not on main)\",\"remove_name\":\"Remove “{{name}}”?\",\"remove_selected\":\"Remove selected\",\"removed\":\"Removed\",\"removed_name\":\"Removed {{name}}\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"Removes worktrees and stops pods. Cannot be undone.\",\"removing\":\"Removing\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"Repoint the live gateway at this worktree (restarts the gateway)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"Repoint the live gateway back at main (restarts the gateway)\",\"restart\":\"Restart\",\"restart_failed\":\"Restart failed\",\"restart_gateway\":\"Restart gateway\",\"restart_gateway_2\":\"Restart gateway?\",\"restart_gateway_to_apply_the_new_build\":\"restart gateway to apply the new build\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"Restart pod\",\"restarted_name\":\"Restarted {{name}}\",\"restarting_completes_the_pending_cutover_boots\":\"Restarting completes the pending cutover: the gateway comes back up on \\\"{{staged}}\\\", not the current checkout. The dashboard will briefly disconnect and reconnect automatically. To back out instead, use Cancel staged cutover.\",\"restarting_reconnecting\":\"Restarting — reconnecting…\",\"rows_count_one\":\"{{n}} row\",\"rows_count_other\":\"{{n}} rows\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} row\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} rows\",\"running_pods\":\"Running pods\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"safely removes worktrees whose PR has already merged.\",\"scanning_merged\":\"Scanning for merged…\",\"select\":\"Select {{name}}\",\"sort_behind\":\"Sort: behind\",\"sort_name\":\"Sort: name\",\"sort_recent\":\"Sort: recent\",\"sort_status\":\"Sort: status\",\"sort_worktrees\":\"Sort worktrees\",\"spin_up_pod\":\"Spin up pod\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"The dashboard will keep using its current version until you run `{{cmd}}`. After that restart it will use “{{name}}” with the same URL and data; this page will not reconnect automatically.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"Start\",\"starting\":\"starting…\",\"starting_pod_for_name_can_take_1_min\":\"Starting pod for {{name}}… (can take ~1 min)\",\"stop_pod\":\"Stop pod\",\"stopped_name\":\"Stopped {{name}}\",\"stopping_pod\":\"Stopping pod\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"Swaps the code behind the live dashboard to this worktree (same port, same data). The gateway restarts and this page reconnects automatically. Refused unless the worktree is provisioned and built.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"Switches the dashboard back to “{{name}}” (same URL and data). The dashboard briefly restarts, and this page reconnects automatically.\",\"sync_progress\":\"Sync progress\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"Sync run lost (gateway restarted mid-sync). Re-run Pull+Build.\",\"synced\":\"Synced\",\"synced_restart_gateway_to_apply_the_new_build\":\"Synced — restart gateway to apply the new build.\",\"syncing\":\"Syncing\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"The live gateway on this port runs from this checkout\",\"the_primary_checkout_is_on_branch_not_base\":\"The primary checkout is on {{branch}}, not {{base}}. Pull + Build refuses to sync until it is switched back to {{base}}.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"The primary checkout this fleet is discovered from\",\"tickets\":\"Tickets:\",\"toggle_log\":\"Toggle log\",\"toggle_provision_log\":\"Toggle provision log\",\"token_mint_failed\":\"Token mint failed\",\"total_disk_used_by_running_pod_homes\":\"Total disk used by running pod homes\",\"uncommitted_changes\":\"uncommitted changes\",\"undo_make_live_failed\":\"Could not switch the dashboard back\",\"undo_to_name\":\"Switch back to {{name}}\",\"up_to_date_with_main\":\"up to date with main\",\"updated\":\"Updated\",\"verifying\":\"Verifying\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"Waiting for the new gateway process. The page reloads automatically once it is up.\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktrees\",\"worktrees_count\":\"Worktrees ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"Worktrees created under a previous repository name. Hidden by default; still covered by Prune merged.\"}}")
	},
	es: {
		api: { "client": {
			"proxy_challenge_reload": "Vuelve a cargar esta pestaña del navegador: si aparece una página de inicio de sesión, la sesión de tu proxy de acceso expiró. Si no, un proxy o firewall delante de este panel rechazó la solicitud; revisa los registros del proxy o vuelve a intentarlo más tarde.",
			"server_temporarily_unavailable_http_status": "El servidor no está disponible temporalmente (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_many": "{{app}} no ha conseguido reiniciarse {{count}} veces seguidas y seguirá intentándolo cada pocos minutos. Para reintentar ahora, desactiva {{app}} y vuelve a activarla.",
				"restart_exhausted_message_one": "{{app}} no ha conseguido reiniciarse {{count}} vez seguida y seguirá intentándolo cada pocos minutos. Para reintentar ahora, desactiva {{app}} y vuelve a activarla.",
				"restart_exhausted_message_other": "{{app}} no ha conseguido reiniciarse {{count}} veces seguidas y seguirá intentándolo cada pocos minutos. Para reintentar ahora, desactiva {{app}} y vuelve a activarla.",
				"restart_exhausted_title": "{{app}} no consigue reiniciarse"
			},
			"devFleet": { "manifest": {
				"configuration_1": "Apunta la app a un checkout de Kiro Crew; las acciones de PR necesitan gh autenticado, mientras que los pods requieren systemd --user en Linux, launchd en macOS o el Programador de tareas en Windows y deben aprovisionarse primero.",
				"description": "Un panel de control para trabajar en Kiro Crew mismo. Lista cada worktree de función junto con el estado de su pull request, su número de commits y su uso de disco, y puede levantar cualquiera de ellos como un pod: una instancia de vista previa completa en su propio puerto y con su propio directorio de datos, para que revises un cambio sin terminar sin tocar tu gateway en vivo. También se encarga de las tareas de alrededor — traer main y recompilar, hacer rebase de una rama, transmitir los logs del pod y purgar los worktrees cuyo trabajo ya se integró.",
				"display_name": "Dev Fleet",
				"highlight_1": "Levanta cualquier worktree como un pod aislado en su propio puerto y directorio de datos, sin tocar tu gateway en vivo",
				"highlight_2": "Vista de flota con el estado del PR por rama, el número de commits y el uso de disco",
				"highlight_3": "Sincroniza (trae main y recompila) o haz rebase de una rama sin salir del panel",
				"highlight_4": "\"Purgar fusionados\" se niega a eliminar un worktree con trabajo sin confirmar o sin seguimiento en lugar de descartarlo",
				"highlight_5": "Transmite los logs del pod y genera tokens de acceso al pod desde la interfaz",
				"highlight_6": "Hecho para quienes desarrollan Kiro Crew mismo — no hace falta para el uso diario",
				"highlight_7": "Los pods corren en Linux (systemd --user), macOS (launchd) y Windows (Programador de tareas) — pero el pod de macOS no tiene un límite de memoria/CPU aplicado; Activar prepara el puntero en todas las plataformas, y el reinicio automático requiere una unidad systemd --user o un LaunchAgent de macOS; la vista de flota, el estado del PR, la sincronización, el rebase y la purga funcionan en cualquier plataforma",
				"page_label": "Dev Fleet",
				"use_case_1": "Gestiona los worktrees de funciones de Kiro Crew y pods de vista previa aislados sin alterar el gateway en producción."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"Acciones\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"Aplica el último Pull+Compilar. El panel se desconectará brevemente y se volverá a conectar por su cuenta.\",\"backend_unavailable\":\"Backend no disponible\",\"behind\":\"Detrás\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"inicia cualquier worktree como un gateway\\n              aislado y desechable para que puedas probar una rama de función sin tocar tu instancia activa.\",\"branch\":\"Rama:\",\"build_finished_restarting_gateway\":\"Compilación completada — reiniciando el gateway…\",\"build_pending\":\"compilación pendiente\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"compilación pendiente — reinicia el gateway para aplicar (kirocrew restart)\",\"building\":\"Compilando…\",\"built\":\"compilado\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"Compilado y listo — inicia un pod desde el menú de la fila para probar esta rama\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"Compilado — pero en este host no pueden ejecutarse pods; previsualízalo con ./dev-backend.sh\",\"cancel\":\"Cancelar\",\"cancel_staged_cutover\":\"Cancelar el cambio preparado\",\"cancel_staged_cutover_2\":\"¿Cancelar el cambio preparado?\",\"cannot_remove_the_main_worktree\":\"No se puede eliminar el worktree principal\",\"cannot_resolve_worktree_path_for_name\":\"No se puede resolver la ruta del worktree de {{name}}\",\"close\":\"Cerrar\",\"closed_has_unmerged_commits\":\"PR cerrado — tiene commits que no están en main\",\"closed_pr_not_on_main_hint\":\"PR cerrado y sin fusionar — su contenido no está en main, así que eliminarlo lo borra de forma permanente. Revisa antes de seleccionar.\",\"collapse\":\"Contraer\",\"commits\":\"Commits:\",\"commits_behind_main\":\"Commits por detrás de main\",\"commits_behind_main_2_many\":\"{{count}} commits por detrás de main\",\"commits_behind_main_2_one\":\"{{count}} commit por detrás de main\",\"commits_behind_main_2_other\":\"{{count}} commits por detrás de main\",\"confirm\":\"Confirmar\",\"conflicts_aborted\":\"Conflictos — cancelado\",\"created_recently\":\"creado recientemente\",\"current_step\":\"paso actual\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"Cambio preparado: este worktree se activará la próxima vez que arranque el gateway. Ejecuta `{{cmd}}` para completarlo, o usa el menú de esta fila → Cancelar el cambio preparado para deshacerlo. Hasta entonces el gateway sigue ejecutando el checkout anterior.\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cambio preparado: este worktree se activará la próxima vez que arranque el gateway. Ejecuta `{{cmd}}` para completarlo — hasta entonces el gateway sigue ejecutando el checkout anterior.\",\"delete_anyway\":\"Eliminar de todos modos\",\"design_docs\":\"Documentos de diseño:\",\"dev_fleet\":\"Flota de desarrollo\",\"discard_untracked_files\":\"También descarta archivos sin seguimiento ({{count}}), entre ellos: {{files}}\",\"discovery_error\":\"Error de detección\",\"disk\":\"Disco:\",\"disk_usage_unavailable\":\"Uso de disco no disponible\",\"disk_worktrees\":\"Disco (worktrees)\",\"dismiss\":\"Descartar\",\"dismiss_sync_status\":\"Descartar el estado de sincronización\",\"each_row_below_is_a_git_worktree_discovered_from\":\"Cada fila de abajo es un worktree de git detectado desde el checkout principal. Usa\",\"empty_worktree_cannot_be_undone\":\"Worktree vacío. No se puede deshacer.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"Todos los worktrees de git del checkout principal. Pull+Compilar sincroniza main; los pods son gateways aislados que se inician desde un worktree.\",\"expand\":\"Expandir\",\"failed\":\"Falló\",\"failed_to_load_logs\":\"No se pudieron cargar los registros\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"Obtiene el último main y reaplica los commits. Se rechaza si hay cambios sin confirmar; si hay conflictos, el rebase se cancela.\",\"filter_worktrees\":\"Filtrar worktrees…\",\"filter_worktrees_2\":\"Filtrar worktrees\",\"finished\":\"Finalizado\",\"force_remove\":\"Forzar eliminación de {{name}}\",\"force_remove_confirm_desc_many\":\"{{count}} de worktrees tienen trabajo sin fusionar o sin confirmar. Eliminarlos borra permanentemente todos los cambios locales. Esta acción no se puede deshacer.\",\"force_remove_confirm_desc_one\":\"{{count}} worktree tiene trabajo sin fusionar o sin confirmar. Eliminarlo borra permanentemente todos los cambios locales. Esta acción no se puede deshacer.\",\"force_remove_confirm_desc_other\":\"{{count}} worktrees tienen trabajo sin fusionar o sin confirmar. Eliminarlos borra permanentemente todos los cambios locales. Esta acción no se puede deshacer.\",\"force_remove_confirm_title\":\"¿Forzar la eliminación de los worktrees?\",\"force_remove_warning\":\"Los worktrees seleccionados tienen trabajo sin fusionar — la eliminación es permanente y no se puede deshacer.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"El gateway no volvió en 60 s — recarga la página manualmente o revisa `kirocrew logs`.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"el gateway se reinició a mitad de la sincronización — se perdió la ejecución; revisa el estado de git y vuelve a ejecutar Pull+Compilar\",\"git_status_failed\":\"git status falló\",\"has_unmerged_work_removing_deletes_permanently\":\"Tiene trabajo sin fusionar — al eliminarlo se BORRA permanentemente.\",\"hide_legacy_worktrees\":\"Ocultar {{n}} worktrees heredados\",\"hide_logs\":\"Ocultar los registros\",\"issues\":\"Issues:\",\"keep_cutover\":\"Mantener el cambio\",\"keeps_name_the_live_target_and_discards_the_stag\":\"Mantiene “{{name}}” como destino activo y descarta el cambio preparado hacia “{{staged}}”. No se reinicia nada: el gateway sigue ejecutando el código actual.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"Mantiene el checkout activo como destino activo y descarta el cambio preparado hacia {{staged}} (no se reinicia nada)\",\"keeps_this_checkout_the_live_target_and_discards\":\"Mantiene este checkout como destino activo y descarta el cambio preparado hacia “{{staged}}” (no se reinicia nada)\",\"kept\":\"Conservados\",\"kept_discard_untracked_hint\":\"Filas retenidas solo por archivos temporales sin seguimiento: marcar una descarta los archivos que se muestran en esa fila.\",\"kept_force_hint\":\"Marque para forzar la eliminación — elimina trabajo no fusionado.\",\"last_commit_activity\":\"Última actividad de commits\",\"legacy_worktrees_hidden_show\":\"{{n}} worktrees heredados ocultos · Mostrar\",\"live\":\"activo\",\"live_checkout_changed_to_name\":\"El panel ahora usa «{{name}}».\",\"live_state_unknown\":\"Estado en vivo no disponible\",\"live_state_unknown_help\":\"El gateway no pudo indicar qué checkout está en vivo (el checkout desde el que se ejecuta el propio gateway) o preparado, así que ninguna fila aparece como en vivo: el estado es desconocido, no vacío. Pregunta al agente antes de poner un checkout en vivo.\",\"live_unverified\":\"¿activo?\",\"load_pod_logs\":\"Cargar los registros del pod\",\"loading\":\"Cargando…\",\"log\":\"registro ▴\",\"log_2\":\"registro ▾\",\"main\":\"· main\",\"make_live\":\"Activar\",\"make_live_failed\":\"Error al activar\",\"make_name_live\":\"¿Activar “{{name}}”?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"Gestiona los worktrees de git de tu checkout principal — sincronización, rebase, pods de QA y limpieza en un solo lugar.\",\"marked_live_but_this_install_cant_confirm_it\":\"Instalación empaquetada: no se puede confirmar que este checkout se ejecute.\",\"more_actions\":\"Más acciones\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"mueve una rama de función al último main, y\",\"needs_provision\":\"Necesita aprovisionamiento\",\"no_candidates_found\":\"No se encontraron candidatos.\",\"no_checkout_found\":\"No se encontró ningún checkout de {{productName}}\",\"no_checkout_found_action\":\"Añade dev_fleet.repo_path al config.json de tu directorio de datos de {{productName}} (~/.kiro/crew por defecto) y esta página lo detecta en la siguiente actualización. La variable de entorno de abajo también funciona, pero una puerta de enlace en ejecución no ve una variable definida después de arrancar, así que esa vía necesita un reinicio.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/ruta/a/tu/checkout\",\"no_checkout_found_help\":\"Dev Fleet gestiona los worktrees de git de un checkout de código de {{productName}}. No se encontró ninguno en tu directorio de proyecto, en el checkout que sirve este panel ni en las ubicaciones de clonación habituales.\",\"no_commits_stale\":\"sin commits, obsoleto\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"Todavía no hay compilación de venv/UI — Aprovisionar compila este worktree para que pueda ejecutarse un pod\",\"no_worktrees_found\":\"No se encontraron worktrees\",\"not_built\":\"sin compilar\",\"nothing_selected\":\"No hay nada seleccionado\",\"nothing_to_prune\":\"No hay nada que purgar\",\"nothing_under_the_worktrees_root_yet\":\"Todavía no hay nada en la raíz de worktrees.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"en la fila de main para hacer fast-forward desde origin y recompilar\\n              (después reinicia el gateway para aplicar).\",\"open\":\"Abrir\",\"orphan_pods_label\":\"Homes de pods huérfanos: {{value}}\",\"parked_on_branch\":\"Detenido en {{branch}}\",\"pending\":\"Pendiente\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"Las acciones Pod y «Activar» están ocultas; todo lo demás en esta página funciona con normalidad.\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"Uso de CPU del pod\",\"pod_home_disk\":\"Disco de homes de pods: {{value}}\",\"pod_home_size\":\"Home del pod: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"Homes de pods que quedan en disco sin un pod activo\",\"pod_memory\":\"Memoria: {{value}}\",\"pod_memory_of_ceiling\":\"Memoria del pod usada frente a su límite de cgroup\",\"pod_running_on\":\"Pod: en ejecución en :\",\"pod_sick\":\"pod con problemas\",\"pod_start_failed\":\"Error al iniciar el pod\",\"pod_task_chip_many\":\"{{n}} tareas\",\"pod_task_chip_one\":\"{{n}} tarea\",\"pod_task_chip_other\":\"{{n}} tareas\",\"pod_task_count\":\"Número de tareas del pod (procesos/hilos)\",\"pod_tasks\":\"Tareas: {{value}}\",\"pod_up\":\"pod activo\",\"pod_up_name\":\"Pod activo: {{name}}\",\"pods_are_unavailable_on_this_host\":\"Los pods no están disponibles en este host.\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR cerrado — la rama tiene commits más recientes\",\"pr_closed_but_verification_unavailable_retry\":\"PR cerrado, pero la verificación no está disponible — vuelve a intentarlo\",\"pr_closed_not_on_main\":\"PR cerrado — no está en main\",\"pr_closed_uncommitted_changes\":\"PR cerrado — cambios sin confirmar\",\"pr_merged\":\"PR fusionado\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR fusionado, pero se subieron commits nuevos después de la fusión\",\"pr_merged_but_verification_unavailable_retry\":\"PR fusionado, pero la verificación no está disponible — vuelve a intentarlo\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR fusionado — es seguro eliminarlo. Ejecuta `git worktree remove`. No se puede deshacer.\",\"pr_merged_uncommitted_changes\":\"PR fusionado, cambios sin confirmar\",\"pr_open_or_unmerged_commits\":\"PR abierto o commits sin fusionar\",\"pr_state_closed\":\"cerrada\",\"pr_state_merged\":\"fusionada\",\"pr_state_open\":\"abierta\",\"protected_worktree\":\"Protegido — principal o actualmente en vivo\",\"provision\":\"Aprovisionar\",\"provision_failed\":\"Error en el aprovisionamiento\",\"provision_failed_exit_code\":\"Error en el aprovisionamiento (salida {{code}})\",\"provision_failed_status\":\"Error en el aprovisionamiento ({{status}})\",\"provision_failed_to_start\":\"No se pudo iniciar el aprovisionamiento\",\"provision_polling_timed_out_check_pod_logs\":\"Se agotó el tiempo de espera del sondeo de aprovisionamiento — revisa los registros del pod\",\"provision_timed_out\":\"Se agotó el tiempo de espera del aprovisionamiento\",\"provisioned\":\"Aprovisionado\",\"provisioning\":\"Aprovisionando\",\"prune\":\"Purgar\",\"prune_complete\":\"Purga completada\",\"prune_failed_count_many\":\"Purga: {{count}} con error\",\"prune_failed_count_one\":\"Purga: {{count}} con error\",\"prune_failed_count_other\":\"Purga: {{count}} con error\",\"prune_failed_to_start\":\"No se pudo iniciar la purga\",\"prune_merged\":\"Purgar fusionados\",\"prune_preview_failed\":\"Error en la vista previa de la purga\",\"prune_worktrees\":\"Purgar worktrees\",\"pruned_worktrees_many\":\"Se purgaron {{count}} worktrees\",\"pruned_worktrees_one\":\"Se purgó {{count}} worktree\",\"pruned_worktrees_other\":\"Se purgaron {{count}} worktrees\",\"pruned_worktrees_some_failed_many\":\"Se purgaron {{count}} worktrees ({{failed}} con error)\",\"pruned_worktrees_some_failed_one\":\"Se purgó {{count}} worktree ({{failed}} con error)\",\"pruned_worktrees_some_failed_other\":\"Se purgaron {{count}} worktrees ({{failed}} con error)\",\"pruning_worktrees\":\"Purgando worktrees\",\"pull_build\":\"Pull + Compilar\",\"pull_build_2\":\"Pull+Compilar\",\"pull_build_failed\":\"Error en Pull+Compilar\",\"pull_build_failed_exit_code_detail\":\"Error en Pull+Compilar (salida {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"No se pudo iniciar Pull+Compilar\",\"pull_build_main\":\"Pull + Compilar main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"Hace pull de la rama base y recompila (~6 min). NO reinicia.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"Descarga la rama base, recompila (~6 min) y reinicia el gateway automáticamente. Mantenga esta página abierta hasta que termine la compilación.\",\"purpose\":\"Propósito:\",\"qa_pod_is_running_but_failing_its_health_check\":\"El pod de QA está en ejecución, pero no pasa su comprobación de estado\",\"qa_pod_is_running_click_open_to_use_it\":\"El pod de QA está en ejecución — haz clic en Abrir para usarlo\",\"qa_video\":\"QA + video\",\"rebase\":\"Rebase\",\"rebase_conflicts\":\"Conflictos de rebase\",\"rebase_failed\":\"Error en el rebase\",\"rebase_name\":\"¿Hacer rebase de “{{name}}”?\",\"rebase_onto_main\":\"Rebase sobre la rama base\",\"rebased_head\":\"Rebase completado (HEAD {{head}})\",\"refresh\":\"Actualizar\",\"refresh_fleet\":\"Actualizar la flota\",\"remove\":\"Eliminar\",\"remove_closed_pr\":\"Eliminar — PR cerrado (no está en main)\",\"remove_name\":\"¿Eliminar “{{name}}”?\",\"remove_selected\":\"Eliminar seleccionados\",\"removed\":\"Eliminado\",\"removed_name\":\"Se eliminó {{name}}\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"Elimina los worktrees y detiene los pods. No se puede deshacer.\",\"removing\":\"Eliminando\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"Reapunta el gateway activo a este worktree (reinicia el gateway)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"Reapunta el gateway activo de nuevo a main (reinicia el gateway)\",\"restart\":\"Reiniciar\",\"restart_failed\":\"Error al reiniciar\",\"restart_gateway\":\"Reiniciar el gateway\",\"restart_gateway_2\":\"¿Reiniciar el gateway?\",\"restart_gateway_to_apply_the_new_build\":\"reinicia el gateway para aplicar la nueva compilación\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"Reiniciar el pod\",\"restarted_name\":\"Se reinició {{name}}\",\"restarting_completes_the_pending_cutover_boots\":\"Reiniciar completa el cambio pendiente: el gateway volverá con \\\"{{staged}}\\\", no con el checkout actual. El panel se desconectará brevemente y se reconectará automáticamente. Para deshacerlo, usa Cancelar el cambio preparado.\",\"restarting_reconnecting\":\"Reiniciando — reconectando…\",\"rows_count_many\":\"{{n}} filas\",\"rows_count_one\":\"{{n}} fila\",\"rows_count_other\":\"{{n}} filas\",\"rows_filtered_count_many\":\"{{shown}} / {{n}} filas\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} fila\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} filas\",\"running_pods\":\"Pods en ejecución\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"elimina de forma segura los worktrees cuyo PR ya se ha fusionado.\",\"scanning_merged\":\"Buscando fusionados…\",\"select\":\"Seleccionar {{name}}\",\"sort_behind\":\"Orden: detrás\",\"sort_name\":\"Orden: nombre\",\"sort_recent\":\"Orden: recientes\",\"sort_status\":\"Orden: estado\",\"sort_worktrees\":\"Ordenar worktrees\",\"spin_up_pod\":\"Iniciar un pod\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"El panel seguirá usando la versión actual hasta que ejecutes `{{cmd}}`. Después del reinicio usará «{{name}}» con la misma URL y los mismos datos; esta página no se reconectará automáticamente.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Prepara este worktree como destino activo (mismo puerto, mismos datos). Dev Fleet no puede reiniciar este gateway, así que el cambio solo se aplica cuando ejecutes `{{cmd}}` manualmente — esta página NO se volverá a conectar por su cuenta. Se rechaza a menos que el worktree esté aprovisionado y compilado.\",\"start\":\"Iniciar\",\"starting\":\"iniciando…\",\"starting_pod_for_name_can_take_1_min\":\"Iniciando el pod de {{name}}… (puede tardar ~1 min)\",\"stop_pod\":\"Detener el pod\",\"stopped_name\":\"Se detuvo {{name}}\",\"stopping_pod\":\"Deteniendo el pod\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"Cambia el código que hay detrás del panel activo por este worktree (mismo puerto, mismos datos). El gateway se reinicia y esta página se vuelve a conectar automáticamente. Se rechaza a menos que el worktree esté aprovisionado y compilado.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"Vuelve a usar «{{name}}» en el panel (misma URL y los mismos datos). El panel se reinicia brevemente y esta página se reconecta automáticamente.\",\"sync_progress\":\"Progreso de la sincronización\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"Se perdió la ejecución de la sincronización (el gateway se reinició a mitad). Vuelve a ejecutar Pull+Compilar.\",\"synced\":\"Sincronizado\",\"synced_restart_gateway_to_apply_the_new_build\":\"Sincronizado — reinicia el gateway para aplicar la nueva compilación.\",\"syncing\":\"Sincronizando\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"El gateway activo en este puerto se ejecuta desde este checkout\",\"the_primary_checkout_is_on_branch_not_base\":\"El checkout principal está en {{branch}}, no en {{base}}. Pull + Compilar se negará a sincronizar hasta que vuelva a {{base}}.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"El checkout principal desde el que se detecta esta flota\",\"tickets\":\"Tickets:\",\"toggle_log\":\"Mostrar u ocultar el registro\",\"toggle_provision_log\":\"Mostrar u ocultar el registro de aprovisionamiento\",\"token_mint_failed\":\"Error al emitir el token\",\"total_disk_used_by_running_pod_homes\":\"Disco total usado por los homes de pods en ejecución\",\"uncommitted_changes\":\"cambios sin confirmar\",\"undo_make_live_failed\":\"No se pudo volver a la versión anterior del panel\",\"undo_to_name\":\"Volver a {{name}}\",\"up_to_date_with_main\":\"actualizado con main\",\"updated\":\"Actualizado\",\"verifying\":\"Verificando\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"Esperando el nuevo proceso del gateway. La página se recarga automáticamente cuando esté disponible.\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktrees\",\"worktrees_count\":\"Worktrees ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"Worktrees creados con un nombre de repositorio anterior. Ocultos por defecto; aun así los cubre Purgar fusionados.\"}}")
	},
	fr: {
		api: { "client": {
			"proxy_challenge_reload": "Recharge cet onglet du navigateur : si une page de connexion apparaît, la session de ton proxy d'accès a expiré. Sinon, un proxy ou un pare-feu devant ce tableau de bord a refusé la requête ; consulte les journaux du proxy ou réessaie plus tard.",
			"server_temporarily_unavailable_http_status": "Le serveur est temporairement indisponible (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_many": "{{app}} n’a pas réussi à redémarrer {{count}} fois de suite et continuera d’essayer toutes les quelques minutes. Pour réessayer maintenant, désactive {{app}} puis réactive-la.",
				"restart_exhausted_message_one": "{{app}} n’a pas réussi à redémarrer {{count}} fois de suite et continuera d’essayer toutes les quelques minutes. Pour réessayer maintenant, désactive {{app}} puis réactive-la.",
				"restart_exhausted_message_other": "{{app}} n’a pas réussi à redémarrer {{count}} fois de suite et continuera d’essayer toutes les quelques minutes. Pour réessayer maintenant, désactive {{app}} puis réactive-la.",
				"restart_exhausted_title": "{{app}} n’arrive pas à redémarrer"
			},
			"devFleet": { "manifest": {
				"configuration_1": "Indique à l'app un checkout Kiro Crew ; les actions sur les PR nécessitent une CLI gh authentifiée, tandis que les pods exigent systemd --user sous Linux, launchd sous macOS ou le Planificateur de tâches sous Windows et doivent d'abord être provisionnés.",
				"description": "Un panneau de contrôle pour travailler sur Kiro Crew lui-même. Liste chaque worktree de fonctionnalité avec l’état de sa pull request, son nombre de commits et son occupation disque, et peut démarrer n’importe lequel sous forme de pod : une instance de prévisualisation complète, sur son propre port et avec son propre répertoire de données, pour parcourir une modification inachevée sans perturber ton gateway en service. Il prend aussi en charge les corvées associées — récupérer main et recompiler, rebaser une branche, diffuser les journaux d’un pod et élaguer les worktrees dont le travail est déjà fusionné.",
				"display_name": "Dev Fleet",
				"highlight_1": "Démarre n’importe quel worktree comme un pod isolé, sur son propre port et son propre répertoire de données, sans toucher à ton gateway en service",
				"highlight_2": "Vue de flotte avec l’état des PR par branche, le nombre de commits et l’occupation disque",
				"highlight_3": "Synchronise (récupère main et recompile) ou rebase une branche sans quitter le tableau de bord",
				"highlight_4": "« Élaguer les worktrees fusionnés » refuse de supprimer un worktree contenant du travail non commité ou non suivi, au lieu de le jeter",
				"highlight_5": "Diffuse les journaux d’un pod et génère des jetons d’accès au pod depuis l’interface",
				"highlight_6": "Conçu pour les personnes qui développent Kiro Crew lui-même — inutile pour un usage quotidien",
				"highlight_7": "Les pods tournent sur Linux (systemd --user), macOS (launchd) et Windows (Planificateur de tâches) — mais le pod macOS n’a aucun plafond mémoire/CPU imposé ; « Mettre en service » prépare le pointeur sur toutes les plateformes, et le redémarrage automatique exige une unité systemd --user ou un LaunchAgent macOS ; la vue de flotte, l’état des PR, la synchronisation, le rebase et l’élagage fonctionnent sur toutes les plateformes",
				"page_label": "Dev Fleet",
				"use_case_1": "Gère les worktrees de fonctionnalités de Kiro Crew et des pods de prévisualisation isolés sans toucher à la passerelle en production."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"Actions\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"Applique le dernier Pull+Build. Le tableau de bord se déconnecte brièvement puis se reconnecte de lui-même.\",\"backend_unavailable\":\"Backend indisponible\",\"behind\":\"En retard\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"démarre n'importe quel worktree comme une\\n              passerelle jetable isolée, pour tester une branche de fonctionnalité sans toucher à votre instance active.\",\"branch\":\"Branche :\",\"build_finished_restarting_gateway\":\"Build terminé — redémarrage du gateway…\",\"build_pending\":\"build en attente\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"build en attente — redémarrez la passerelle pour appliquer (kirocrew restart)\",\"building\":\"Compilation…\",\"built\":\"compilé\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"Compilé et prêt — démarre un pod depuis le menu de la ligne pour tester cette branche\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"Compilé — mais les pods ne peuvent pas tourner sur cet hôte ; utilise plutôt ./dev-backend.sh pour prévisualiser\",\"cancel\":\"Annuler\",\"cancel_staged_cutover\":\"Annuler la bascule préparée\",\"cancel_staged_cutover_2\":\"Annuler la bascule préparée?\",\"cannot_remove_the_main_worktree\":\"Impossible de retirer le worktree principal\",\"cannot_resolve_worktree_path_for_name\":\"Impossible de résoudre le chemin du worktree pour {{name}}\",\"close\":\"Fermer\",\"closed_has_unmerged_commits\":\"PR fermée — comporte des commits absents de main\",\"closed_pr_not_on_main_hint\":\"PR fermée et non fusionnée — son contenu est absent de main ; la supprimer l'efface définitivement. Vérifiez avant de sélectionner.\",\"collapse\":\"Réduire\",\"commits\":\"Commits :\",\"commits_behind_main\":\"Commits en retard sur main\",\"commits_behind_main_2_many\":\"{{count}} commits en retard sur main\",\"commits_behind_main_2_one\":\"{{count}} commit en retard sur main\",\"commits_behind_main_2_other\":\"{{count}} commits en retard sur main\",\"confirm\":\"Confirmer\",\"conflicts_aborted\":\"Conflits — abandonné\",\"created_recently\":\"créé récemment\",\"current_step\":\"étape actuelle\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"Bascule préparée : ce worktree deviendra actif au prochain démarrage de la passerelle. Exécutez `{{cmd}}` pour la terminer, ou utilisez le menu de cette ligne → Annuler la bascule préparée pour revenir en arrière. D'ici là, la passerelle exécute toujours le checkout précédent.\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"Supprimer quand même\",\"design_docs\":\"Docs de conception :\",\"dev_fleet\":\"Flotte de dev\",\"discard_untracked_files\":\"Supprime aussi des fichiers non suivis ({{count}}), dont : {{files}}\",\"discovery_error\":\"Erreur de découverte\",\"disk\":\"Disque :\",\"disk_usage_unavailable\":\"Utilisation du disque indisponible\",\"disk_worktrees\":\"Disque (worktrees)\",\"dismiss\":\"Masquer\",\"dismiss_sync_status\":\"Masquer l'état de la synchronisation\",\"each_row_below_is_a_git_worktree_discovered_from\":\"Chaque ligne ci-dessous est un worktree git détecté depuis le checkout principal. Utilisez\",\"empty_worktree_cannot_be_undone\":\"Worktree vide. Action irréversible.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"Tous les worktrees git du checkout principal. Pull+Build synchronise main ; les pods sont des passerelles isolées démarrées depuis un worktree.\",\"expand\":\"Développer\",\"failed\":\"Échec\",\"failed_to_load_logs\":\"Échec du chargement des journaux\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"Récupère le dernier main et rejoue les commits. Refusé si l’arbre est modifié ; en cas de conflit, le rebase est abandonné.\",\"filter_worktrees\":\"Filtrer les worktrees…\",\"filter_worktrees_2\":\"Filtrer les worktrees\",\"finished\":\"Terminé\",\"force_remove\":\"Forcer la suppression de {{name}}\",\"force_remove_confirm_desc_many\":\"{{count}} de worktrees ont du travail non fusionné ou non validé. Les supprimer efface définitivement toutes les modifications locales. Cette action est irréversible.\",\"force_remove_confirm_desc_one\":\"{{count}} worktree a du travail non fusionné ou non validé. Le supprimer efface définitivement toutes les modifications locales. Cette action est irréversible.\",\"force_remove_confirm_desc_other\":\"{{count}} worktrees ont du travail non fusionné ou non validé. Les supprimer efface définitivement toutes les modifications locales. Cette action est irréversible.\",\"force_remove_confirm_title\":\"Forcer la suppression des worktrees ?\",\"force_remove_warning\":\"Les worktrees sélectionnés ont du travail non fusionné — la suppression est définitive et irréversible.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"La passerelle n’est pas revenue en 60 s — recharge la page manuellement ou consulte `kirocrew logs`.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"la passerelle a redémarré en pleine synchronisation — exécution perdue ; vérifie l’état git et relance Pull+Build\",\"git_status_failed\":\"échec de git status\",\"has_unmerged_work_removing_deletes_permanently\":\"Contient du travail non fusionné — le retirer le SUPPRIME définitivement.\",\"hide_legacy_worktrees\":\"Masquer les {{n}} anciens worktrees\",\"hide_logs\":\"Masquer les journaux\",\"issues\":\"Issues :\",\"keep_cutover\":\"Garder la bascule\",\"keeps_name_the_live_target_and_discards_the_stag\":\"Conserve « {{name}} » comme cible active et abandonne la bascule préparée vers « {{staged}} ». Rien ne redémarre — la passerelle continue d'exécuter le code actuel.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"Conserve le checkout actif comme cible active et abandonne la bascule préparée vers {{staged}} (rien ne redémarre)\",\"keeps_this_checkout_the_live_target_and_discards\":\"Conserve ce checkout comme cible active et abandonne la bascule préparée vers « {{staged}} » (rien ne redémarre)\",\"kept\":\"Conservés\",\"kept_discard_untracked_hint\":\"Lignes bloquées uniquement par des fichiers temporaires non suivis : en cocher une supprime les fichiers listés sur cette ligne.\",\"kept_force_hint\":\"Cochez pour forcer la suppression — supprime le travail non fusionné.\",\"last_commit_activity\":\"Dernière activité de commit\",\"legacy_worktrees_hidden_show\":\"{{n}} anciens worktrees masqués · Afficher\",\"live\":\"actif\",\"live_checkout_changed_to_name\":\"Le tableau de bord utilise maintenant « {{name}} ».\",\"live_state_unknown\":\"État live indisponible\",\"live_state_unknown_help\":\"La passerelle n'a pas pu indiquer quel checkout est live (le checkout depuis lequel la passerelle elle-même s'exécute) ou préparé ; aucune ligne n'est donc marquée live — l'état est inconnu, pas vide. Demande à l'agent avant de passer un checkout en live.\",\"live_unverified\":\"actif ?\",\"load_pod_logs\":\"Charger les journaux du pod\",\"loading\":\"Chargement…\",\"log\":\"journal ▴\",\"log_2\":\"journal ▾\",\"main\":\"· main\",\"make_live\":\"Mettre en service\",\"make_live_failed\":\"Échec de la mise en service\",\"make_name_live\":\"Rendre « {{name}} » actif ?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"Gérez les worktrees git de votre checkout principal — synchronisation, rebase, pods de QA et nettoyage au même endroit.\",\"marked_live_but_this_install_cant_confirm_it\":\"Installation empaquetée : impossible de confirmer que ce checkout s'exécute.\",\"more_actions\":\"Plus d'actions\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"déplace une branche de fonctionnalité sur le dernier main, et\",\"needs_provision\":\"Provisionnement requis\",\"no_candidates_found\":\"Aucun candidat trouvé.\",\"no_checkout_found\":\"Aucun checkout {{productName}} trouvé\",\"no_checkout_found_action\":\"Ajoute dev_fleet.repo_path au config.json de ton répertoire de données {{productName}} (~/.kiro/crew par défaut), et cette page le prend en compte au prochain rafraîchissement. La variable d'environnement ci-dessous fonctionne aussi, mais une passerelle déjà démarrée ne voit pas une variable définie après son lancement, donc cette méthode exige un redémarrage.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/chemin/vers/ton/checkout\",\"no_checkout_found_help\":\"Dev Fleet gère les worktrees git d'un checkout des sources de {{productName}}. Aucun n'a été trouvé dans ton répertoire de projet, dans le checkout qui sert ce tableau de bord, ni aux emplacements de clonage habituels.\",\"no_commits_stale\":\"aucun commit, obsolète\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"Pas encore de venv ni de build d’interface — Provisionner compile ce worktree pour qu’un pod puisse s’exécuter\",\"no_worktrees_found\":\"Aucun worktree trouvé\",\"not_built\":\"non compilé\",\"nothing_selected\":\"Aucune sélection\",\"nothing_to_prune\":\"Rien à élaguer\",\"nothing_under_the_worktrees_root_yet\":\"Rien dans la racine des worktrees pour l'instant.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"sur la ligne main pour la mettre à jour en fast-forward depuis origin et reconstruire\\n              (puis redémarrez la passerelle pour appliquer).\",\"open\":\"Ouvrir\",\"orphan_pods_label\":\"Homes de pods orphelins : {{value}}\",\"parked_on_branch\":\"Resté sur {{branch}}\",\"pending\":\"En attente\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"Les actions Pod et « Mettre en service » sont masquées ; tout le reste de cette page fonctionne normalement.\",\"pod_cpu\":\"CPU : {{value}}\",\"pod_cpu_usage\":\"Utilisation CPU du pod\",\"pod_home_disk\":\"Disque des homes de pods : {{value}}\",\"pod_home_size\":\"Home du pod : {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"Homes de pods restés sur le disque sans pod actif\",\"pod_memory\":\"Mémoire : {{value}}\",\"pod_memory_of_ceiling\":\"Mémoire du pod utilisée par rapport à son plafond cgroup\",\"pod_running_on\":\"Pod : en cours sur :\",\"pod_sick\":\"pod défaillant\",\"pod_start_failed\":\"Échec du démarrage du pod\",\"pod_task_chip_many\":\"{{n}} tâches\",\"pod_task_chip_one\":\"{{n}} tâche\",\"pod_task_chip_other\":\"{{n}} tâches\",\"pod_task_count\":\"Nombre de tâches du pod (processus/threads)\",\"pod_tasks\":\"Tâches : {{value}}\",\"pod_up\":\"pod actif\",\"pod_up_name\":\"Pod démarré : {{name}}\",\"pods_are_unavailable_on_this_host\":\"Les pods ne sont pas disponibles sur cet hôte.\",\"pr\":\"PR :\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR fermée — la branche a des commits plus récents\",\"pr_closed_but_verification_unavailable_retry\":\"PR fermée, mais vérification indisponible — réessayer\",\"pr_closed_not_on_main\":\"PR fermée — absente de main\",\"pr_closed_uncommitted_changes\":\"PR fermée — modifications non validées\",\"pr_merged\":\"PR fusionnée\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR fusionnée, mais de nouveaux commits ont été poussés après la fusion\",\"pr_merged_but_verification_unavailable_retry\":\"PR fusionnée, mais vérification indisponible — réessayer\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR fusionnée — retrait sans risque. Exécute `git worktree remove`. Action irréversible.\",\"pr_merged_uncommitted_changes\":\"PR fusionnée, modifications non validées\",\"pr_open_or_unmerged_commits\":\"PR ouverte ou commits non fusionnés\",\"pr_state_closed\":\"fermée\",\"pr_state_merged\":\"fusionnée\",\"pr_state_open\":\"ouverte\",\"protected_worktree\":\"Protégé — worktree principal ou actuellement actif\",\"provision\":\"Provisionner\",\"provision_failed\":\"Échec du provisionnement\",\"provision_failed_exit_code\":\"Échec du provisionnement (code de sortie {{code}})\",\"provision_failed_status\":\"Échec du provisionnement ({{status}})\",\"provision_failed_to_start\":\"Le provisionnement n’a pas démarré\",\"provision_polling_timed_out_check_pod_logs\":\"Délai dépassé lors du suivi du provisionnement — consulte les journaux du pod\",\"provision_timed_out\":\"Délai de provisionnement dépassé\",\"provisioned\":\"Provisionné\",\"provisioning\":\"Provisionnement\",\"prune\":\"Élaguer\",\"prune_complete\":\"Élagage terminé\",\"prune_failed_count_many\":\"Élagage : {{count}} en échec\",\"prune_failed_count_one\":\"Élagage : {{count}} en échec\",\"prune_failed_count_other\":\"Élagage : {{count}} en échec\",\"prune_failed_to_start\":\"L’élagage n’a pas démarré\",\"prune_merged\":\"Élaguer les fusionnés\",\"prune_preview_failed\":\"Échec de l’aperçu de l’élagage\",\"prune_worktrees\":\"Élaguer les worktrees\",\"pruned_worktrees_many\":\"{{count}} worktrees élagués\",\"pruned_worktrees_one\":\"{{count}} worktree élagué\",\"pruned_worktrees_other\":\"{{count}} worktrees élagués\",\"pruned_worktrees_some_failed_many\":\"{{count}} worktrees élagués ({{failed}} en échec)\",\"pruned_worktrees_some_failed_one\":\"{{count}} worktree élagué ({{failed}} en échec)\",\"pruned_worktrees_some_failed_other\":\"{{count}} worktrees élagués ({{failed}} en échec)\",\"pruning_worktrees\":\"Élagage des worktrees\",\"pull_build\":\"Pull + Build\",\"pull_build_2\":\"Pull+Build\",\"pull_build_failed\":\"Échec de Pull+Build\",\"pull_build_failed_exit_code_detail\":\"Échec de Pull+Build (code de sortie {{code}}) : {{detail}}\",\"pull_build_failed_to_start\":\"Pull+Build n’a pas démarré\",\"pull_build_main\":\"Pull + Build de main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"Récupère la branche de base et recompile (~6 min). NE redémarre PAS.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"Télécharge la branche de base, recompile (~6 min) puis redémarre le gateway automatiquement. Garde cette page ouverte jusqu'à la fin du build.\",\"purpose\":\"Objectif :\",\"qa_pod_is_running_but_failing_its_health_check\":\"Le pod de QA tourne mais échoue à son contrôle de santé\",\"qa_pod_is_running_click_open_to_use_it\":\"Le pod de QA tourne — clique sur Ouvrir pour l’utiliser\",\"qa_video\":\"QA + vidéo\",\"rebase\":\"Rebase\",\"rebase_conflicts\":\"Conflits de rebase\",\"rebase_failed\":\"Échec du rebase\",\"rebase_name\":\"Rebaser « {{name}} » ?\",\"rebase_onto_main\":\"Rebase sur la branche de base\",\"rebased_head\":\"Rebasé (HEAD {{head}})\",\"refresh\":\"Actualiser\",\"refresh_fleet\":\"Actualiser la flotte\",\"remove\":\"Supprimer\",\"remove_closed_pr\":\"Supprimer — PR fermée (absente de main)\",\"remove_name\":\"Supprimer « {{name}} » ?\",\"remove_selected\":\"Supprimer la sélection\",\"removed\":\"Supprimé\",\"removed_name\":\"{{name}} supprimé\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"Supprime les worktrees et arrête les pods. Action irréversible.\",\"removing\":\"Retrait en cours\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"Rediriger la passerelle en service vers ce worktree (redémarre la passerelle)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"Rebasculer la passerelle active sur main (redémarre la passerelle)\",\"restart\":\"Redémarrer\",\"restart_failed\":\"Échec du redémarrage\",\"restart_gateway\":\"Redémarrer la passerelle\",\"restart_gateway_2\":\"Redémarrer la passerelle ?\",\"restart_gateway_to_apply_the_new_build\":\"redémarrez la passerelle pour appliquer le nouveau build\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"Redémarrer le pod\",\"restarted_name\":\"{{name}} redémarré\",\"restarting_completes_the_pending_cutover_boots\":\"Redémarrer termine la bascule en attente : la passerelle reviendra sur «{{staged}}», pas sur le checkout actuel. Le tableau de bord se déconnectera brièvement puis se reconnectera automatiquement. Pour revenir en arrière, utilisez plutôt Annuler la bascule préparée.\",\"restarting_reconnecting\":\"Redémarrage — reconnexion…\",\"rows_count_many\":\"{{n}} lignes\",\"rows_count_one\":\"{{n}} ligne\",\"rows_count_other\":\"{{n}} lignes\",\"rows_filtered_count_many\":\"{{shown}} / {{n}} lignes\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} ligne\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} lignes\",\"running_pods\":\"Pods en cours\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"supprime en toute sécurité les worktrees dont la PR a déjà été fusionnée.\",\"scanning_merged\":\"Recherche des fusionnés…\",\"select\":\"Sélectionner {{name}}\",\"sort_behind\":\"Tri : retard\",\"sort_name\":\"Tri : nom\",\"sort_recent\":\"Tri : récent\",\"sort_status\":\"Tri : statut\",\"sort_worktrees\":\"Trier les worktrees\",\"spin_up_pod\":\"Démarrer un pod\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"Le tableau de bord continuera d’utiliser sa version actuelle jusqu’à l’exécution de `{{cmd}}`. Après ce redémarrage, il utilisera « {{name}} » avec la même URL et les mêmes données ; cette page ne se reconnectera pas automatiquement.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"Démarrer\",\"starting\":\"démarrage…\",\"starting_pod_for_name_can_take_1_min\":\"Démarrage du pod pour {{name}}… (peut prendre ~1 min)\",\"stop_pod\":\"Arrêter le pod\",\"stopped_name\":\"{{name}} arrêté\",\"stopping_pod\":\"Arrêt du pod\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"Bascule le code derrière le tableau de bord en service vers ce worktree (même port, mêmes données). La passerelle redémarre et cette page se reconnecte automatiquement. Refusé si le worktree n’est pas provisionné et compilé.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"Rétablit « {{name}} » dans le tableau de bord (même URL et mêmes données). Le tableau de bord redémarre brièvement et cette page se reconnecte automatiquement.\",\"sync_progress\":\"Progression de la synchronisation\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"Exécution de synchronisation perdue (la passerelle a redémarré en pleine synchronisation). Relance Pull+Build.\",\"synced\":\"Synchronisé\",\"synced_restart_gateway_to_apply_the_new_build\":\"Synchronisé — redémarre la passerelle pour appliquer le nouveau build.\",\"syncing\":\"Synchronisation\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"La passerelle active sur ce port s'exécute depuis ce checkout\",\"the_primary_checkout_is_on_branch_not_base\":\"Le checkout principal est sur {{branch}}, pas sur {{base}}. Pull + Build refusera de synchroniser tant qu'il n'est pas rebasculé sur {{base}}.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"Le checkout principal à partir duquel cette flotte est détectée\",\"tickets\":\"Tickets :\",\"toggle_log\":\"Afficher/masquer le journal\",\"toggle_provision_log\":\"Afficher/masquer le journal de provisionnement\",\"token_mint_failed\":\"Échec de la génération du jeton\",\"total_disk_used_by_running_pod_homes\":\"Disque total utilisé par les homes de pods en cours d'exécution\",\"uncommitted_changes\":\"modifications non commitées\",\"undo_make_live_failed\":\"Impossible de rétablir la version précédente du tableau de bord\",\"undo_to_name\":\"Revenir à {{name}}\",\"up_to_date_with_main\":\"à jour avec main\",\"updated\":\"Mis à jour\",\"verifying\":\"Vérification\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"En attente du nouveau processus de passerelle. La page se recharge automatiquement dès qu'il est prêt.\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktrees\",\"worktrees_count\":\"Worktrees ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"Worktrees créés sous un ancien nom de dépôt. Masqués par défaut ; toujours pris en compte par Élaguer les fusionnés.\"}}")
	},
	hi: {
		api: { "client": {
			"proxy_challenge_reload": "इस ब्राउज़र टैब को रीलोड करो — अगर साइन-इन पेज दिखे, तो एक्सेस प्रॉक्सी का सत्र समाप्त हो गया है। नहीं दिखे तो इस डैशबोर्ड के आगे लगे प्रॉक्सी या फ़ायरवॉल ने अनुरोध ठुकरा दिया; प्रॉक्सी के लॉग देखो, या बाद में फिर कोशिश करो।",
			"server_temporarily_unavailable_http_status": "सर्वर अस्थायी रूप से अनुपलब्ध है (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_one": "{{app}} लगातार {{count}} बार पुनः आरंभ होने में विफल रहा है और हर कुछ मिनट में प्रयास करता रहेगा। अभी पुनः प्रयास करने के लिए, {{app}} को अक्षम करके फिर से सक्षम करो।",
				"restart_exhausted_message_other": "{{app}} लगातार {{count}} बार पुनः आरंभ होने में विफल रहा है और हर कुछ मिनट में प्रयास करता रहेगा। अभी पुनः प्रयास करने के लिए, {{app}} को अक्षम करके फिर से सक्षम करो।",
				"restart_exhausted_title": "{{app}} पुनः आरंभ नहीं हो पा रहा है"
			},
			"devFleet": { "manifest": {
				"configuration_1": "ऐप को Kiro Crew checkout का पथ दो; PR कार्रवाइयों के लिए प्रमाणित gh चाहिए, जबकि pod को पहले provision करना होगा और Linux पर systemd --user, macOS पर launchd या Windows पर Task Scheduler चाहिए।",
				"description": "खुद Kiro Crew पर काम करने के लिए एक कंट्रोल पैनल। हर फ़ीचर वर्कट्री को उसकी पुल रिक्वेस्ट स्थिति, कमिट संख्या और डिस्क इस्तेमाल के साथ दिखाता है, और उनमें से किसी को भी पॉड के रूप में चला सकता है: अपने पोर्ट और अपनी डेटा डायरेक्टरी वाला पूरा प्रीव्यू इंस्टेंस, ताकि तुम अपने लाइव गेटवे को छेड़े बिना अधूरे बदलाव को क्लिक करके देख सको। इससे जुड़े छोटे काम भी यह सँभालता है — main खींचना और दोबारा बिल्ड करना, ब्रांच रीबेस करना, पॉड लॉग स्ट्रीम करना, और जिन वर्कट्री का काम मर्ज हो चुका है उन्हें हटाना।",
				"display_name": "Dev Fleet",
				"highlight_1": "किसी भी वर्कट्री को अपने पोर्ट और डेटा डायरेक्टरी वाले अलग पॉड के रूप में चलाओ, तुम्हारा लाइव गेटवे अछूता रहता है",
				"highlight_2": "हर ब्रांच की PR स्थिति, कमिट संख्या और डिस्क इस्तेमाल के साथ फ़्लीट व्यू",
				"highlight_3": "डैशबोर्ड छोड़े बिना सिंक करो (main खींचो और दोबारा बिल्ड करो) या ब्रांच रीबेस करो",
				"highlight_4": "'Prune merged' बिना कमिट या बिना ट्रैक किए काम वाली वर्कट्री को फेंकने की जगह हटाने से मना कर देती है",
				"highlight_5": "UI से पॉड लॉग स्ट्रीम करो और पॉड ऐक्सेस टोकन बनाओ",
				"highlight_6": "खुद Kiro Crew बनाने वालों के लिए — रोज़मर्रा के इस्तेमाल के लिए ज़रूरी नहीं",
				"highlight_7": "पॉड Linux (systemd --user), macOS (launchd) और Windows (Task Scheduler) पर चलते हैं — लेकिन macOS पॉड पर मेमोरी/CPU की कोई तय सीमा लागू नहीं होती; Make Live हर प्लैटफ़ॉर्म पर पॉइंटर स्टेज करता है, और अपने-आप रीस्टार्ट के लिए systemd --user यूनिट या macOS LaunchAgent चाहिए; फ़्लीट व्यू, PR स्थिति, सिंक, रीबेस और प्रून हर प्लैटफ़ॉर्म पर काम करते हैं",
				"page_label": "Dev Fleet",
				"use_case_1": "चालू गेटवे को छुए बिना Kiro Crew feature worktree और अलग preview pod संचालित करें।"
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"कार्रवाइयां\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"पिछले पुल+बिल्ड को लागू करता है। डैशबोर्ड थोड़ी देर डिस्कनेक्ट होकर अपने-आप फिर कनेक्ट हो जाएगा।\",\"backend_unavailable\":\"बैकएंड उपलब्ध नहीं है\",\"behind\":\"पीछे\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"किसी भी वर्कट्री को एक\\n              अलग, अस्थायी गेटवे के रूप में चालू करता है, ताकि आप अपने लाइव इंस्टेंस को छुए बिना किसी फ़ीचर ब्रांच का QA कर सकें।\",\"branch\":\"ब्रांच:\",\"build_finished_restarting_gateway\":\"बिल्ड पूरा हुआ — गेटवे पुनः प्रारंभ हो रहा है…\",\"build_pending\":\"बिल्ड बाकी है\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"बिल्ड बाकी है — लागू करने के लिए गेटवे रीस्टार्ट करें (kirocrew restart)\",\"building\":\"बिल्ड हो रहा है…\",\"built\":\"बिल्ड हो गया\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"बिल्ड होकर तैयार — इस ब्रांच का QA करने के लिए रो मेन्यू से पॉड शुरू करें\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"बिल्ड हो गया — लेकिन इस होस्ट पर पॉड नहीं चल सकते; इसके बजाय ./dev-backend.sh से प्रीव्यू करें\",\"cancel\":\"रद्द करें\",\"cancel_staged_cutover\":\"स्टेज किया गया कटओवर रद्द करें\",\"cancel_staged_cutover_2\":\"स्टेज किया गया कटओवर रद्द करें?\",\"cannot_remove_the_main_worktree\":\"मुख्य वर्कट्री हटाई नहीं जा सकती\",\"cannot_resolve_worktree_path_for_name\":\"{{name}} के लिए वर्कट्री पथ हल नहीं हो सका\",\"close\":\"बंद करें\",\"closed_has_unmerged_commits\":\"बंद PR — main पर न होने वाले कमिट हैं\",\"closed_pr_not_on_main_hint\":\"बंद, बिना मर्ज की गई PR — इसकी सामग्री main पर नहीं है, इसलिए हटाने पर वह स्थायी रूप से मिट जाएगी। चुनने से पहले जाँच करें।\",\"collapse\":\"समेटें\",\"commits\":\"कमिट:\",\"commits_behind_main\":\"main से पीछे कमिट\",\"commits_behind_main_2_one\":\"main से {{count}} कमिट पीछे\",\"commits_behind_main_2_other\":\"main से {{count}} कमिट पीछे\",\"confirm\":\"पुष्टि करें\",\"conflicts_aborted\":\"कॉन्फ़्लिक्ट — रद्द किया गया\",\"created_recently\":\"हाल ही में बनी\",\"current_step\":\"मौजूदा चरण\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"कटओवर स्टेज किया गया: गेटवे के अगली बार शुरू होने पर यह वर्कट्री लाइव हो जाएगी। इसे पूरा करने के लिए `{{cmd}}` चलाएँ, या वापस लेने के लिए इस पंक्ति के मेनू → स्टेज किया गया कटओवर रद्द करें का उपयोग करें। तब तक गेटवे पिछले चेकआउट पर ही चलता रहेगा।\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"फिर भी हटाएँ\",\"design_docs\":\"डिज़ाइन दस्तावेज़:\",\"dev_fleet\":\"डेव फ़्लीट\",\"discard_untracked_files\":\"इसके साथ अनट्रैक्ड फाइलें ({{count}}) भी हटा दी जाती हैं, जिनमें शामिल हैं: {{files}}\",\"discovery_error\":\"डिस्कवरी त्रुटि\",\"disk\":\"डिस्क:\",\"disk_usage_unavailable\":\"डिस्क उपयोग उपलब्ध नहीं\",\"disk_worktrees\":\"डिस्क (वर्कट्री)\",\"dismiss\":\"खारिज करें\",\"dismiss_sync_status\":\"सिंक स्थिति खारिज करें\",\"each_row_below_is_a_git_worktree_discovered_from\":\"नीचे दी गई हर पंक्ति main चेकआउट से मिली एक git वर्कट्री है। उपयोग करें\",\"empty_worktree_cannot_be_undone\":\"खाली वर्कट्री। इसे वापस नहीं लाया जा सकता।\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"मुख्य चेकआउट की हर git वर्कट्री। पुल+बिल्ड main को सिंक करता है; पॉड अलग-थलग गेटवे हैं जो किसी वर्कट्री से बूट होते हैं।\",\"expand\":\"विस्तृत करें\",\"failed\":\"विफल\",\"failed_to_load_logs\":\"लॉग लोड नहीं हो सके\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"नवीनतम main फ़ेच करके कमिट दोबारा लगाता है। डर्टी होने पर मना कर देता है; कॉन्फ़्लिक्ट पर रीबेस रद्द कर दिया जाता है।\",\"filter_worktrees\":\"वर्कट्री फ़िल्टर करें…\",\"filter_worktrees_2\":\"वर्कट्री फ़िल्टर करें\",\"finished\":\"समाप्त\",\"force_remove\":\"{{name}} बलपूर्वक हटाएं\",\"force_remove_confirm_desc_one\":\"{{count}} worktree में अनमर्ज्ड या बिना कमिट किया काम है। इसे हटाने से सभी लोकल बदलाव स्थायी रूप से मिट जाएँगे। इसे वापस नहीं लाया जा सकता।\",\"force_remove_confirm_desc_other\":\"{{count}} worktree में अनमर्ज्ड या बिना कमिट किया काम है। इन्हें हटाने से सभी लोकल बदलाव स्थायी रूप से मिट जाएँगे। इसे वापस नहीं लाया जा सकता।\",\"force_remove_confirm_title\":\"worktree ज़बरन हटाएँ?\",\"force_remove_warning\":\"चुनी गई worktree में अनमर्ज्ड काम है — हटाना स्थायी है और वापस नहीं लाया जा सकता।\",\"gateway_did_not_come_back_within_60s_reload_the\":\"गेटवे 60s में वापस नहीं आया — पेज खुद रीलोड करें, या `kirocrew logs` देखें।\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"सिंक के बीच गेटवे पुनः आरंभ हुआ — रन खो गया; git स्थिति जाँचें और पुल+बिल्ड दोबारा चलाएँ\",\"git_status_failed\":\"git status विफल\",\"has_unmerged_work_removing_deletes_permanently\":\"इसमें अनमर्ज्ड काम है — हटाने पर यह स्थायी रूप से मिट जाएगा।\",\"hide_legacy_worktrees\":\"{{n}} पुरानी वर्कट्री छिपाओ\",\"hide_logs\":\"लॉग छिपाएँ\",\"issues\":\"इश्यू:\",\"keep_cutover\":\"कटओवर रखें\",\"keeps_name_the_live_target_and_discards_the_stag\":\"“{{name}}” लाइव लक्ष्य बना रहता है और “{{staged}}” पर स्टेज किया गया स्विच हटा दिया जाता है। कुछ भी पुनरारंभ नहीं होता — गेटवे वही कोड चलाता रहता है जो अभी चल रहा है।\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"लाइव चेकआउट लाइव लक्ष्य बना रहता है और {{staged}} पर स्टेज किया गया स्विच हटा दिया जाता है (कुछ भी पुनरारंभ नहीं होता)\",\"keeps_this_checkout_the_live_target_and_discards\":\"यह चेकआउट लाइव लक्ष्य बना रहता है और “{{staged}}” पर स्टेज किया गया स्विच हटा दिया जाता है (कुछ भी पुनरारंभ नहीं होता)\",\"kept\":\"रखा गया\",\"kept_discard_untracked_hint\":\"केवल अनट्रैक्ड अस्थायी फाइलों के कारण रुकी पंक्तियाँ: किसी एक को चेक करने पर उस पंक्ति में सूचीबद्ध फाइलें हटा दी जाती हैं।\",\"kept_force_hint\":\"बलपूर्वक हटाने के लिए चेक करें — अनमर्ज किया गया कार्य हटा देता है।\",\"last_commit_activity\":\"आख़िरी कमिट गतिविधि\",\"legacy_worktrees_hidden_show\":\"{{n}} पुरानी वर्कट्री छिपी हैं · दिखाओ\",\"live\":\"लाइव\",\"live_checkout_changed_to_name\":\"डैशबोर्ड अब “{{name}}” का उपयोग कर रहा है।\",\"live_state_unknown\":\"लाइव स्थिति उपलब्ध नहीं\",\"live_state_unknown_help\":\"गेटवे यह नहीं बता सका कि कौन-सा चेकआउट लाइव (वह चेकआउट जिससे गेटवे स्वयं चलता है) या स्टेज्ड है, इसलिए कोई पंक्ति लाइव के रूप में चिह्नित नहीं है — यह स्थिति अज्ञात है, खाली नहीं। किसी चेकआउट को लाइव करने से पहले एजेंट से पूछें।\",\"live_unverified\":\"लाइव?\",\"load_pod_logs\":\"पॉड लॉग लोड करें\",\"loading\":\"लोड हो रहा है…\",\"log\":\"लॉग ▴\",\"log_2\":\"लॉग ▾\",\"main\":\"· main\",\"make_live\":\"लाइव करें\",\"make_live_failed\":\"लाइव करना विफल\",\"make_name_live\":\"“{{name}}” को लाइव करें?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"अपने main चेकआउट की git वर्कट्री एक ही जगह से प्रबंधित करें — सिंक, रीबेस, QA पॉड और सफ़ाई।\",\"marked_live_but_this_install_cant_confirm_it\":\"पैकेज्ड इंस्टॉल: पुष्टि नहीं हो सकती कि यह चेकआउट चल रहा है।\",\"more_actions\":\"और कार्रवाइयां\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"किसी फ़ीचर ब्रांच को नए main पर ले जाता है, और\",\"needs_provision\":\"प्रोविज़न चाहिए\",\"no_candidates_found\":\"कोई उम्मीदवार नहीं मिला।\",\"no_checkout_found\":\"कोई {{productName}} चेकआउट नहीं मिला\",\"no_checkout_found_action\":\"{{productName}} डेटा डायरेक्टरी (डिफ़ॉल्ट रूप से ~/.kiro/crew) की config.json में dev_fleet.repo_path जोड़ो, और यह पेज अगले रिफ़्रेश पर उस पाथ को पढ़ लेगा। नीचे दिया एनवायरनमेंट वेरिएबल भी काम करता है, लेकिन चल रहा गेटवे शुरू होने के बाद सेट किए वेरिएबल को नहीं देख पाता, इसलिए उस तरीके के लिए रीस्टार्ट चाहिए।\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/चेकआउट/का/पथ\",\"no_checkout_found_help\":\"Dev Fleet, {{productName}} सोर्स चेकआउट के git worktrees प्रबंधित करता है। यह प्रोजेक्ट डायरेक्टरी में, इस डैशबोर्ड को सर्व करने वाले चेकआउट में, या सामान्य क्लोन स्थानों में नहीं मिला।\",\"no_commits_stale\":\"कोई कमिट नहीं, पुरानी\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"अभी कोई venv/UI बिल्ड नहीं — प्रोविज़न इस वर्कट्री को बिल्ड करता है ताकि पॉड चल सके\",\"no_worktrees_found\":\"कोई वर्कट्री नहीं मिली\",\"not_built\":\"बिल्ड नहीं\",\"nothing_selected\":\"कुछ चुना नहीं गया\",\"nothing_to_prune\":\"प्रून करने के लिए कुछ नहीं\",\"nothing_under_the_worktrees_root_yet\":\"वर्कट्री रूट में अभी कुछ नहीं है।\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"main पंक्ति पर, उसे origin से फ़ास्ट-फ़ॉरवर्ड करके दोबारा बिल्ड करने के लिए\\n              (फिर लागू करने के लिए गेटवे रीस्टार्ट करें)।\",\"open\":\"खोलें\",\"orphan_pods_label\":\"अनाथ पॉड होम: {{value}}\",\"parked_on_branch\":\"{{branch}} पर रुका हुआ\",\"pending\":\"लंबित\",\"pod\":\"पॉड\",\"pod_2\":\"पॉड\",\"pod_and_make_live_actions_are_hidden_everything\":\"पॉड और “लाइव करें” क्रियाएँ छिपी हुई हैं; इस पेज पर बाकी सब सामान्य रूप से काम करता है।\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"पॉड CPU उपयोग\",\"pod_home_disk\":\"पॉड-होम डिस्क: {{value}}\",\"pod_home_size\":\"पॉड होम: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"बिना किसी सक्रिय पॉड के डिस्क पर बचे पॉड होम\",\"pod_memory\":\"मेमोरी: {{value}}\",\"pod_memory_of_ceiling\":\"इसकी cgroup सीमा के सापेक्ष उपयोग की गई पॉड मेमोरी\",\"pod_running_on\":\"पॉड: चल रहा है :\",\"pod_sick\":\"पॉड अस्वस्थ\",\"pod_start_failed\":\"पॉड शुरू करना विफल\",\"pod_task_chip_one\":\"{{n}} कार्य\",\"pod_task_chip_other\":\"{{n}} कार्य\",\"pod_task_count\":\"पॉड कार्य (प्रोसेस/थ्रेड) संख्या\",\"pod_tasks\":\"कार्य: {{value}}\",\"pod_up\":\"पॉड चालू\",\"pod_up_name\":\"पॉड चालू: {{name}}\",\"pods_are_unavailable_on_this_host\":\"इस होस्ट पर पॉड उपलब्ध नहीं हैं।\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR बंद — ब्रांच में नए कमिट हैं\",\"pr_closed_but_verification_unavailable_retry\":\"PR बंद पर पुष्टि उपलब्ध नहीं — फिर कोशिश करें\",\"pr_closed_not_on_main\":\"PR बंद — main पर नहीं\",\"pr_closed_uncommitted_changes\":\"PR बंद — बिना कमिट किए बदलाव\",\"pr_merged\":\"PR मर्ज हो गया\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR मर्ज हुआ, पर मर्ज के बाद नए कमिट पुश हुए\",\"pr_merged_but_verification_unavailable_retry\":\"PR मर्ज हुआ पर पुष्टि उपलब्ध नहीं — फिर कोशिश करें\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR मर्ज हो गया — हटाना सुरक्षित है। `git worktree remove` चलाता है। इसे वापस नहीं लाया जा सकता।\",\"pr_merged_uncommitted_changes\":\"PR मर्ज हुआ, बिना कमिट बदलाव हैं\",\"pr_open_or_unmerged_commits\":\"PR खुला है या कमिट अनमर्ज्ड हैं\",\"pr_state_closed\":\"बंद\",\"pr_state_merged\":\"मर्ज हुआ\",\"pr_state_open\":\"खुला\",\"protected_worktree\":\"सुरक्षित — main या वर्तमान में लाइव\",\"provision\":\"प्रोविज़न करें\",\"provision_failed\":\"प्रोविज़न विफल\",\"provision_failed_exit_code\":\"प्रोविज़न विफल (exit {{code}})\",\"provision_failed_status\":\"प्रोविज़न विफल ({{status}})\",\"provision_failed_to_start\":\"प्रोविज़न शुरू नहीं हो सका\",\"provision_polling_timed_out_check_pod_logs\":\"प्रोविज़न पोलिंग का समय समाप्त — पॉड लॉग देखें\",\"provision_timed_out\":\"प्रोविज़न का समय समाप्त\",\"provisioned\":\"प्रोविज़न हो गया\",\"provisioning\":\"प्रोविज़न हो रहा है\",\"prune\":\"प्रून करें\",\"prune_complete\":\"प्रून पूरा हुआ\",\"prune_failed_count_one\":\"प्रून: {{count}} विफल\",\"prune_failed_count_other\":\"प्रून: {{count}} विफल\",\"prune_failed_to_start\":\"प्रून शुरू नहीं हो सका\",\"prune_merged\":\"मर्ज्ड प्रून करें\",\"prune_preview_failed\":\"प्रून पूर्वावलोकन विफल\",\"prune_worktrees\":\"वर्कट्री प्रून करें\",\"pruned_worktrees_one\":\"{{count}} वर्कट्री प्रून किया गया\",\"pruned_worktrees_other\":\"{{count}} वर्कट्री प्रून किए गए\",\"pruned_worktrees_some_failed_one\":\"{{count}} वर्कट्री प्रून किया गया ({{failed}} विफल)\",\"pruned_worktrees_some_failed_other\":\"{{count}} वर्कट्री प्रून किए गए ({{failed}} विफल)\",\"pruning_worktrees\":\"वर्कट्री प्रून हो रही हैं\",\"pull_build\":\"पुल + बिल्ड\",\"pull_build_2\":\"पुल+बिल्ड\",\"pull_build_failed\":\"पुल+बिल्ड विफल\",\"pull_build_failed_exit_code_detail\":\"Pull+Build विफल (exit {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"पुल+बिल्ड शुरू नहीं हो सका\",\"pull_build_main\":\"main पुल + बिल्ड करें\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"बेस ब्रांच पुल करके दोबारा बिल्ड करता है (~6 मिनट)। पुनः आरंभ नहीं करता।\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"बेस ब्रांच खींचता है, रीबिल्ड करता है (~6 मिनट), फिर गेटवे स्वतः पुनः प्रारंभ करता है। बिल्ड पूरा होने तक यह पृष्ठ खुला रखो।\",\"purpose\":\"उद्देश्य:\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA पॉड चल रहा है पर उसकी हेल्थ जाँच विफल हो रही है\",\"qa_pod_is_running_click_open_to_use_it\":\"QA पॉड चल रहा है — इसे उपयोग करने के लिए खोलें पर क्लिक करें\",\"qa_video\":\"QA + वीडियो\",\"rebase\":\"रीबेस करें\",\"rebase_conflicts\":\"रीबेस कॉन्फ़्लिक्ट\",\"rebase_failed\":\"रीबेस विफल\",\"rebase_name\":\"“{{name}}” को रीबेस करें?\",\"rebase_onto_main\":\"बेस ब्रांच पर रीबेस करो\",\"rebased_head\":\"रीबेस हो गया (HEAD {{head}})\",\"refresh\":\"रिफ़्रेश करें\",\"refresh_fleet\":\"फ़्लीट रीफ़्रेश करें\",\"remove\":\"हटाएं\",\"remove_closed_pr\":\"हटाएँ — बंद PR (main पर नहीं)\",\"remove_name\":\"“{{name}}” को हटाएँ?\",\"remove_selected\":\"चयनित हटाएं\",\"removed\":\"हटाया गया\",\"removed_name\":\"{{name}} हटा दिया\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"वर्कट्री हटा देता है और पॉड बंद कर देता है। इसे वापस नहीं लाया जा सकता।\",\"removing\":\"हटाया जा रहा है\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"लाइव गेटवे को इस वर्कट्री पर लगाएँ (गेटवे पुनः आरंभ होता है)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"लाइव गेटवे को फिर से main पर लगाएं (गेटवे रीस्टार्ट होगा)\",\"restart\":\"पुनः आरंभ करें\",\"restart_failed\":\"पुनः आरंभ विफल\",\"restart_gateway\":\"गेटवे रीस्टार्ट करें\",\"restart_gateway_2\":\"गेटवे पुनः आरंभ करें?\",\"restart_gateway_to_apply_the_new_build\":\"नया बिल्ड लागू करने के लिए गेटवे रीस्टार्ट करें\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"पॉड पुनः आरंभ करें\",\"restarted_name\":\"{{name}} रीस्टार्ट हो गया\",\"restarting_completes_the_pending_cutover_boots\":\"पुनरारंभ करने से लंबित कटओवर पूरा हो जाता है: गेटवे \\\"{{staged}}\\\" पर वापस आएगा, वर्तमान चेकआउट पर नहीं। डैशबोर्ड कुछ देर के लिए डिस्कनेक्ट होकर अपने आप फिर से जुड़ जाएगा। वापस लेने के लिए इसके बजाय स्टेज किया गया कटओवर रद्द करें का उपयोग करें।\",\"restarting_reconnecting\":\"पुनः आरंभ हो रहा है — फिर कनेक्ट हो रहा है…\",\"rows_count_one\":\"{{n}} पंक्ति\",\"rows_count_other\":\"{{n}} पंक्तियां\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} पंक्ति\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} पंक्तियां\",\"running_pods\":\"चल रहे पॉड\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"उन वर्कट्री को सुरक्षित रूप से हटा देता है जिनका PR पहले ही मर्ज हो चुका है।\",\"scanning_merged\":\"मर्ज्ड खोजे जा रहे हैं…\",\"select\":\"{{name}} चुनो\",\"sort_behind\":\"क्रम: पीछे\",\"sort_name\":\"क्रम: नाम\",\"sort_recent\":\"क्रम: हाल का\",\"sort_status\":\"क्रम: स्थिति\",\"sort_worktrees\":\"वर्कट्री क्रमित करें\",\"spin_up_pod\":\"पॉड शुरू करें\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"जब तक तुम `{{cmd}}` नहीं चलाते, डैशबोर्ड मौजूदा वर्शन का उपयोग करता रहेगा। रीस्टार्ट के बाद यह उसी URL और डेटा के साथ “{{name}}” का उपयोग करेगा; यह पेज अपने आप फिर से कनेक्ट नहीं होगा।\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"शुरू करें\",\"starting\":\"शुरू हो रहा है…\",\"starting_pod_for_name_can_take_1_min\":\"{{name}} के लिए पॉड शुरू हो रहा है… (~1 मिनट लग सकता है)\",\"stop_pod\":\"पॉड बंद करें\",\"stopped_name\":\"{{name}} बंद हो गया\",\"stopping_pod\":\"पॉड रोका जा रहा है\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"लाइव डैशबोर्ड के पीछे का कोड इस वर्कट्री पर बदल देता है (वही पोर्ट, वही डेटा)। गेटवे पुनः आरंभ होता है और यह पेज अपने-आप फिर कनेक्ट हो जाता है। वर्कट्री प्रोविज़न और बिल्ड न हो तो मना कर देता है।\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"डैशबोर्ड को वापस “{{name}}” पर ले जाता है (वही URL और डेटा)। डैशबोर्ड थोड़ी देर के लिए रीस्टार्ट होता है और यह पेज अपने आप फिर से कनेक्ट हो जाता है।\",\"sync_progress\":\"सिंक की प्रगति\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"सिंक रन खो गया (सिंक के बीच गेटवे पुनः आरंभ हुआ)। पुल+बिल्ड दोबारा चलाएँ।\",\"synced\":\"सिंक हो गया\",\"synced_restart_gateway_to_apply_the_new_build\":\"सिंक हो गया — नया बिल्ड लागू करने के लिए गेटवे पुनः आरंभ करें।\",\"syncing\":\"सिंक हो रहा है\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"इस पोर्ट पर लाइव गेटवे इसी चेकआउट से चलता है\",\"the_primary_checkout_is_on_branch_not_base\":\"प्राथमिक चेकआउट {{branch}} पर है, {{base}} पर नहीं। इसे वापस {{base}} पर स्विच किए जाने तक पुल + बिल्ड सिंक करने से इनकार कर देगा।\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"मुख्य चेकआउट, जिससे यह फ़्लीट खोजा जाता है\",\"tickets\":\"टिकट:\",\"toggle_log\":\"लॉग दिखाएं/छिपाएं\",\"toggle_provision_log\":\"प्रोविज़न लॉग दिखाएं/छिपाएं\",\"token_mint_failed\":\"टोकन बनाना विफल\",\"total_disk_used_by_running_pod_homes\":\"चल रहे पॉड होम द्वारा उपयोग की गई कुल डिस्क\",\"uncommitted_changes\":\"बिना कमिट किए बदलाव\",\"undo_make_live_failed\":\"डैशबोर्ड को वापस नहीं ले जाया जा सका\",\"undo_to_name\":\"{{name}} पर वापस जाएँ\",\"up_to_date_with_main\":\"main के साथ अद्यतन\",\"updated\":\"अपडेट हुआ\",\"verifying\":\"सत्यापित किया जा रहा है\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"नई गेटवे प्रक्रिया का इंतज़ार है। चालू होते ही पेज अपने आप रीलोड हो जाएगा।\",\"worktree\":\"वर्कट्री\",\"worktrees\":\"वर्कट्री\",\"worktrees_count\":\"वर्कट्री ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"पिछले रिपॉज़िटरी नाम के तहत बनी वर्कट्री। डिफ़ॉल्ट रूप से छिपी हुई; फिर भी मर्ज हो चुकी वर्कट्री प्रून करने में शामिल।\"}}")
	},
	it: {
		api: { "client": {
			"proxy_challenge_reload": "Ricarica questa scheda del browser: se compare una pagina di accesso, la sessione del tuo proxy di accesso è scaduta. Altrimenti un proxy o un firewall davanti a questa dashboard ha rifiutato la richiesta; controlla i log del proxy oppure riprova più tardi.",
			"server_temporarily_unavailable_http_status": "Il server è temporaneamente non disponibile (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_many": "{{app}} non è riuscita a riavviarsi {{count}} volte di seguito e continuerà a riprovare ogni pochi minuti. Per riprovare subito, disattiva {{app}} e riattivala.",
				"restart_exhausted_message_one": "{{app}} non è riuscita a riavviarsi {{count}} volta di seguito e continuerà a riprovare ogni pochi minuti. Per riprovare subito, disattiva {{app}} e riattivala.",
				"restart_exhausted_message_other": "{{app}} non è riuscita a riavviarsi {{count}} volte di seguito e continuerà a riprovare ogni pochi minuti. Per riprovare subito, disattiva {{app}} e riattivala.",
				"restart_exhausted_title": "{{app}} non riesce a riavviarsi"
			},
			"devFleet": { "manifest": {
				"configuration_1": "Indica all'app un checkout di Kiro Crew; le azioni sulle PR richiedono gh autenticato, mentre i pod richiedono systemd --user su Linux, launchd su macOS o l'Utilità di pianificazione su Windows e devono prima essere predisposti.",
				"description": "Un pannello di controllo per lavorare su Kiro Crew stesso. Elenca ogni worktree di funzionalità con lo stato della sua pull request, il numero di commit e lo spazio occupato su disco, e può avviarne uno qualsiasi come pod: un’istanza di anteprima completa, su una porta e una cartella dati proprie, così puoi provare una modifica non finita senza disturbare il gateway attivo. Si occupa anche delle incombenze che ne derivano — fare pull di main e ricompilare, fare il rebase di un branch, seguire i log dei pod ed eliminare i worktree il cui lavoro è già stato unito.",
				"display_name": "Dev Fleet",
				"highlight_1": "Avvia qualsiasi worktree come pod isolato, su una porta e una cartella dati proprie, lasciando intatto il gateway attivo",
				"highlight_2": "Vista della flotta con stato della PR per branch, numero di commit e spazio su disco",
				"highlight_3": "Sincronizza (pull di main e ricompilazione) o fai il rebase di un branch senza uscire dalla dashboard",
				"highlight_4": "«Elimina i worktree uniti» si rifiuta di cancellare un worktree con lavoro non committato o non tracciato, invece di buttarlo via",
				"highlight_5": "Segui i log dei pod e genera le chiavi di accesso ai pod dall’interfaccia",
				"highlight_6": "Pensata per chi sviluppa Kiro Crew stesso — non serve per l’uso quotidiano",
				"highlight_7": "I pod funzionano su Linux (systemd --user), macOS (launchd) e Windows (Utilità di pianificazione) — ma il pod su macOS non ha un limite di memoria/CPU imposto; Make Live prepara il puntatore su ogni piattaforma, e il riavvio automatico richiede un’unità systemd --user o un LaunchAgent di macOS; vista della flotta, stato della PR, sincronizzazione, rebase ed eliminazione funzionano su qualsiasi piattaforma",
				"page_label": "Dev Fleet",
				"use_case_1": "Gestisci i worktree delle funzionalità di Kiro Crew e pod di anteprima isolati senza modificare il gateway live."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"Azioni\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"Applica l'ultimo Pull+Build. La dashboard si disconnetterà brevemente e si riconnetterà da sola.\",\"backend_unavailable\":\"Backend non disponibile\",\"behind\":\"In ritardo\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"avvia qualsiasi worktree come\\n              gateway isolato e temporaneo, così puoi testare un branch di funzionalità senza toccare la tua istanza attiva.\",\"branch\":\"Branch:\",\"build_finished_restarting_gateway\":\"Build completata — riavvio del gateway…\",\"build_pending\":\"build in attesa\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"build in attesa — riavvia il gateway per applicare (kirocrew restart)\",\"building\":\"Build in corso…\",\"built\":\"build pronta\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"Build pronta — avvia un pod dal menu della riga per fare QA su questo branch\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"Build pronta — ma su questo host i pod non possono girare; usa ./dev-backend.sh per l'anteprima\",\"cancel\":\"Annulla\",\"cancel_staged_cutover\":\"Annulla il passaggio preparato\",\"cancel_staged_cutover_2\":\"Annullare il passaggio preparato?\",\"cannot_remove_the_main_worktree\":\"Impossibile rimuovere il worktree principale\",\"cannot_resolve_worktree_path_for_name\":\"Impossibile risolvere il percorso del worktree per {{name}}\",\"close\":\"Chiudi\",\"closed_has_unmerged_commits\":\"PR chiusa — contiene commit non presenti su main\",\"closed_pr_not_on_main_hint\":\"PR chiusa e non unita — il suo contenuto non è su main, quindi rimuoverla la elimina in modo permanente. Controlla prima di selezionare.\",\"collapse\":\"Comprimi\",\"commits\":\"Commit:\",\"commits_behind_main\":\"Commit di ritardo rispetto a main\",\"commits_behind_main_2_many\":\"{{count}} commit di ritardo rispetto a main\",\"commits_behind_main_2_one\":\"{{count}} commit di ritardo rispetto a main\",\"commits_behind_main_2_other\":\"{{count}} commit di ritardo rispetto a main\",\"confirm\":\"Conferma\",\"conflicts_aborted\":\"Conflitti — interrotto\",\"created_recently\":\"creato di recente\",\"current_step\":\"passaggio corrente\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"Passaggio preparato: questo worktree diventerà attivo al prossimo avvio del gateway. Esegui `{{cmd}}` per completarlo, oppure usa il menu di questa riga → Annulla il passaggio preparato per annullarlo. Fino ad allora il gateway continua a eseguire il checkout precedente.\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"Elimina comunque\",\"design_docs\":\"Documenti di progettazione:\",\"dev_fleet\":\"Dev Fleet\",\"discard_untracked_files\":\"Scarta anche file non tracciati ({{count}}), tra cui: {{files}}\",\"discovery_error\":\"Errore di rilevamento\",\"disk\":\"Disco:\",\"disk_usage_unavailable\":\"Utilizzo del disco non disponibile\",\"disk_worktrees\":\"Disco (worktree)\",\"dismiss\":\"Ignora\",\"dismiss_sync_status\":\"Ignora lo stato della sincronizzazione\",\"each_row_below_is_a_git_worktree_discovered_from\":\"Ogni riga qui sotto è un worktree git rilevato dal checkout principale. Usa\",\"empty_worktree_cannot_be_undone\":\"Worktree vuoto. Operazione irreversibile.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"Ogni worktree git del checkout principale. Pull+Build sincronizza main; i pod sono gateway isolati avviati da un worktree.\",\"expand\":\"Espandi\",\"failed\":\"Non riuscito\",\"failed_to_load_logs\":\"Caricamento dei log non riuscito\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"Recupera l'ultimo main e riapplica i commit. Rifiutato se ci sono modifiche non salvate; in caso di conflitto il rebase viene interrotto.\",\"filter_worktrees\":\"Filtra i worktree…\",\"filter_worktrees_2\":\"Filtra i worktree\",\"finished\":\"Completato\",\"force_remove\":\"Forza rimozione di {{name}}\",\"force_remove_confirm_desc_many\":\"{{count}} di worktree hanno lavoro non unito o non committato. Rimuoverli elimina permanentemente tutte le modifiche locali. Operazione irreversibile.\",\"force_remove_confirm_desc_one\":\"{{count}} worktree ha lavoro non unito o non committato. Rimuoverlo elimina permanentemente tutte le modifiche locali. Operazione irreversibile.\",\"force_remove_confirm_desc_other\":\"{{count}} worktree hanno lavoro non unito o non committato. Rimuoverli elimina permanentemente tutte le modifiche locali. Operazione irreversibile.\",\"force_remove_confirm_title\":\"Forzare la rimozione dei worktree?\",\"force_remove_warning\":\"I worktree selezionati hanno lavoro non unito — la rimozione è permanente e irreversibile.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"Il gateway non è tornato disponibile entro 60s — ricarica la pagina manualmente oppure controlla `kirocrew logs`.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"il gateway si è riavviato durante la sincronizzazione — esecuzione perduta; controlla lo stato di git e riesegui Pull+Build\",\"git_status_failed\":\"git status non riuscito\",\"has_unmerged_work_removing_deletes_permanently\":\"Contiene lavoro non unito — la rimozione ELIMINA in modo permanente.\",\"hide_legacy_worktrees\":\"Nascondi {{n}} worktree legacy\",\"hide_logs\":\"Nascondi i log\",\"issues\":\"Issue:\",\"keep_cutover\":\"Mantieni il passaggio\",\"keeps_name_the_live_target_and_discards_the_stag\":\"Mantiene «{{name}}» come destinazione attiva e scarta il passaggio preparato verso «{{staged}}». Non viene riavviato nulla: il gateway continua a eseguire il codice attuale.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"Mantiene il checkout attivo come destinazione attiva e scarta il passaggio preparato verso {{staged}} (non viene riavviato nulla)\",\"keeps_this_checkout_the_live_target_and_discards\":\"Mantiene questo checkout come destinazione attiva e scarta il passaggio preparato verso «{{staged}}» (non viene riavviato nulla)\",\"kept\":\"Mantenuto\",\"kept_discard_untracked_hint\":\"Righe trattenute solo da file temporanei non tracciati: selezionarne una scarta i file elencati in quella riga.\",\"kept_force_hint\":\"Seleziona per forzare la rimozione — elimina il lavoro non unito.\",\"last_commit_activity\":\"Ultima attività di commit\",\"legacy_worktrees_hidden_show\":\"{{n}} worktree legacy nascosti · Mostra\",\"live\":\"in diretta\",\"live_checkout_changed_to_name\":\"Il dashboard ora usa “{{name}}”.\",\"live_state_unknown\":\"Stato live non disponibile\",\"live_state_unknown_help\":\"Il gateway non è riuscito a indicare quale checkout è live (il checkout da cui è in esecuzione il gateway stesso) o in attesa, quindi nessuna riga è contrassegnata come live: lo stato è sconosciuto, non vuoto. Chiedi all'agente prima di rendere live un checkout.\",\"live_unverified\":\"in diretta?\",\"load_pod_logs\":\"Carica i log del pod\",\"loading\":\"Caricamento…\",\"log\":\"log ▴\",\"log_2\":\"log ▾\",\"main\":\"· main\",\"make_live\":\"Rendi attivo\",\"make_live_failed\":\"Attivazione non riuscita\",\"make_name_live\":\"Rendere attivo «{{name}}»?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"Gestisci i worktree git del tuo checkout principale — sincronizzazione, rebase, pod di QA e pulizia in un unico posto.\",\"marked_live_but_this_install_cant_confirm_it\":\"Installazione pacchettizzata: impossibile confermare che questo checkout sia in esecuzione.\",\"more_actions\":\"Altre azioni\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"sposta un branch di funzionalità sull'ultimo main, e\",\"needs_provision\":\"Richiede il provisioning\",\"no_candidates_found\":\"Nessun candidato trovato.\",\"no_checkout_found\":\"Nessun checkout di {{productName}} trovato\",\"no_checkout_found_action\":\"Aggiungi dev_fleet.repo_path al config.json nella directory dati di {{productName}} (~/.kiro/crew per impostazione predefinita) e questa pagina lo rileva al prossimo aggiornamento. Anche la variabile d'ambiente qui sotto funziona, ma un gateway già avviato non vede una variabile impostata dopo l'avvio, quindi quella strada richiede un riavvio.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/percorso/del/tuo/checkout\",\"no_checkout_found_help\":\"Dev Fleet gestisce i worktree git di un checkout dei sorgenti di {{productName}}. Non è stato trovato né nella directory del progetto, né nel checkout che serve questa dashboard, né nelle consuete posizioni di clonazione.\",\"no_commits_stale\":\"nessun commit, obsoleto\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"Nessuna build venv/UI — il provisioning compila questo worktree per poter avviare un pod\",\"no_worktrees_found\":\"Nessun worktree trovato\",\"not_built\":\"non compilato\",\"nothing_selected\":\"Nessuna selezione\",\"nothing_to_prune\":\"Niente da eliminare\",\"nothing_under_the_worktrees_root_yet\":\"Ancora nulla nella radice dei worktree.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"sulla riga main per aggiornarla da origin e ricompilare\\n              (poi riavvia il gateway per applicare).\",\"open\":\"Apri\",\"orphan_pods_label\":\"Home di pod orfani: {{value}}\",\"parked_on_branch\":\"Fermo su {{branch}}\",\"pending\":\"In attesa\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"Le azioni Pod e «Rendi attivo» sono nascoste; tutto il resto di questa pagina funziona normalmente.\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"Utilizzo CPU del pod\",\"pod_home_disk\":\"Disco home dei pod: {{value}}\",\"pod_home_size\":\"Home del pod: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"Home di pod rimasti su disco senza un pod attivo\",\"pod_memory\":\"Memoria: {{value}}\",\"pod_memory_of_ceiling\":\"Memoria del pod usata rispetto al limite cgroup\",\"pod_running_on\":\"Pod: in esecuzione su :\",\"pod_sick\":\"pod non integro\",\"pod_start_failed\":\"Avvio del pod non riuscito\",\"pod_task_chip_many\":\"{{n}} task\",\"pod_task_chip_one\":\"{{n}} task\",\"pod_task_chip_other\":\"{{n}} task\",\"pod_task_count\":\"Numero di task del pod (processi/thread)\",\"pod_tasks\":\"Task: {{value}}\",\"pod_up\":\"pod attivo\",\"pod_up_name\":\"Pod attivo: {{name}}\",\"pods_are_unavailable_on_this_host\":\"I pod non sono disponibili su questo host.\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR chiusa — il branch ha commit più recenti\",\"pr_closed_but_verification_unavailable_retry\":\"PR chiusa ma verifica non disponibile — riprova\",\"pr_closed_not_on_main\":\"PR chiusa — non è su main\",\"pr_closed_uncommitted_changes\":\"PR chiusa — modifiche non salvate\",\"pr_merged\":\"PR unita\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR unita ma nuovi commit inviati dopo il merge\",\"pr_merged_but_verification_unavailable_retry\":\"PR unita ma verifica non disponibile — riprova\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR unita — si può rimuovere senza rischi. Esegue `git worktree remove`. Operazione irreversibile.\",\"pr_merged_uncommitted_changes\":\"PR unita, modifiche non committate\",\"pr_open_or_unmerged_commits\":\"PR aperta o commit non uniti\",\"pr_state_closed\":\"chiusa\",\"pr_state_merged\":\"unita\",\"pr_state_open\":\"aperta\",\"protected_worktree\":\"Protetto — principale o attualmente live\",\"provision\":\"Esegui il provisioning\",\"provision_failed\":\"Provisioning non riuscito\",\"provision_failed_exit_code\":\"Provisioning non riuscito (uscita {{code}})\",\"provision_failed_status\":\"Provisioning non riuscito ({{status}})\",\"provision_failed_to_start\":\"Avvio del provisioning non riuscito\",\"provision_polling_timed_out_check_pod_logs\":\"Timeout nel polling del provisioning — controlla i log del pod\",\"provision_timed_out\":\"Timeout del provisioning\",\"provisioned\":\"Provisioning eseguito\",\"provisioning\":\"Provisioning\",\"prune\":\"Elimina\",\"prune_complete\":\"Eliminazione completata\",\"prune_failed_count_many\":\"Eliminazione: {{count}} non riusciti\",\"prune_failed_count_one\":\"Eliminazione: {{count}} non riuscito\",\"prune_failed_count_other\":\"Eliminazione: {{count}} non riusciti\",\"prune_failed_to_start\":\"Avvio dell'eliminazione non riuscito\",\"prune_merged\":\"Elimina i worktree uniti\",\"prune_preview_failed\":\"Anteprima dell'eliminazione non riuscita\",\"prune_worktrees\":\"Elimina i worktree\",\"pruned_worktrees_many\":\"{{count}} worktree eliminati\",\"pruned_worktrees_one\":\"{{count}} worktree eliminato\",\"pruned_worktrees_other\":\"{{count}} worktree eliminati\",\"pruned_worktrees_some_failed_many\":\"{{count}} worktree eliminati ({{failed}} non riusciti)\",\"pruned_worktrees_some_failed_one\":\"{{count}} worktree eliminato ({{failed}} non riusciti)\",\"pruned_worktrees_some_failed_other\":\"{{count}} worktree eliminati ({{failed}} non riusciti)\",\"pruning_worktrees\":\"Eliminazione dei worktree\",\"pull_build\":\"Pull + build\",\"pull_build_2\":\"Pull+Build\",\"pull_build_failed\":\"Pull+build non riuscito\",\"pull_build_failed_exit_code_detail\":\"Pull+Build non riuscito (uscita {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"Avvio di Pull+Build non riuscito\",\"pull_build_main\":\"Pull + build di main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"Recupera il branch di base e ricompila (~6 min). NON riavvia.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"Scarica il branch di base, ricompila (~6 min) e riavvia il gateway automaticamente. Tieni questa pagina aperta fino al termine del build.\",\"purpose\":\"Scopo:\",\"qa_pod_is_running_but_failing_its_health_check\":\"Il pod QA è in esecuzione ma non supera il controllo di integrità\",\"qa_pod_is_running_click_open_to_use_it\":\"Il pod QA è in esecuzione — clicca Apri per usarlo\",\"qa_video\":\"QA + video\",\"rebase\":\"Rebase\",\"rebase_conflicts\":\"Conflitti di rebase\",\"rebase_failed\":\"Rebase non riuscito\",\"rebase_name\":\"Eseguire il rebase di «{{name}}»?\",\"rebase_onto_main\":\"Rebase sul branch di base\",\"rebased_head\":\"Rebase eseguito (HEAD {{head}})\",\"refresh\":\"Aggiorna\",\"refresh_fleet\":\"Aggiorna la fleet\",\"remove\":\"Rimuovi\",\"remove_closed_pr\":\"Rimuovi — PR chiusa (non è su main)\",\"remove_name\":\"Rimuovere «{{name}}»?\",\"remove_selected\":\"Rimuovi i selezionati\",\"removed\":\"Rimosso\",\"removed_name\":\"{{name}} rimosso\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"Rimuove i worktree e arresta i pod. Operazione irreversibile.\",\"removing\":\"Rimozione\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"Punta il gateway attivo su questo worktree (riavvia il gateway)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"Riporta il gateway attivo su main (riavvia il gateway)\",\"restart\":\"Riavvia\",\"restart_failed\":\"Riavvio non riuscito\",\"restart_gateway\":\"Riavvia il gateway\",\"restart_gateway_2\":\"Riavviare il gateway?\",\"restart_gateway_to_apply_the_new_build\":\"riavvia il gateway per applicare la nuova build\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"Riavvia il pod\",\"restarted_name\":\"{{name}} riavviato\",\"restarting_completes_the_pending_cutover_boots\":\"Il riavvio completa il passaggio in sospeso: il gateway ripartirà su \\\"{{staged}}\\\", non sul checkout attuale. La dashboard si disconnetterà brevemente e si riconnetterà automaticamente. Per annullare, usa invece Annulla il passaggio preparato.\",\"restarting_reconnecting\":\"Riavvio — riconnessione…\",\"rows_count_many\":\"{{n}} righe\",\"rows_count_one\":\"{{n}} riga\",\"rows_count_other\":\"{{n}} righe\",\"rows_filtered_count_many\":\"{{shown}} / {{n}} righe\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} riga\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} righe\",\"running_pods\":\"Pod in esecuzione\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"rimuove in sicurezza i worktree la cui PR è già stata unita.\",\"scanning_merged\":\"Ricerca dei worktree uniti…\",\"select\":\"Seleziona {{name}}\",\"sort_behind\":\"Ordinamento: in ritardo\",\"sort_name\":\"Ordinamento: nome\",\"sort_recent\":\"Ordinamento: recenti\",\"sort_status\":\"Ordinamento: stato\",\"sort_worktrees\":\"Ordina i worktree\",\"spin_up_pod\":\"Avvia un pod\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"Il dashboard continuerà a usare la versione attuale finché non esegui `{{cmd}}`. Dopo il riavvio userà “{{name}}” con lo stesso URL e gli stessi dati; questa pagina non si ricollegherà automaticamente.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"Avvia\",\"starting\":\"avvio…\",\"starting_pod_for_name_can_take_1_min\":\"Avvio del pod per {{name}}… (può richiedere ~1 min)\",\"stop_pod\":\"Arresta il pod\",\"stopped_name\":\"{{name}} arrestato\",\"stopping_pod\":\"Arresto del pod\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"Sostituisce il codice dietro la dashboard attiva con questo worktree (stessa porta, stessi dati). Il gateway si riavvia e questa pagina si riconnette automaticamente. Rifiutato se il worktree non è stato sottoposto a provisioning e compilato.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"Riporta il dashboard a “{{name}}” (stesso URL e stessi dati). Il dashboard si riavvia brevemente e questa pagina si ricollega automaticamente.\",\"sync_progress\":\"Avanzamento della sincronizzazione\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"Esecuzione della sincronizzazione perduta (il gateway si è riavviato durante la sincronizzazione). Riesegui Pull+Build.\",\"synced\":\"Sincronizzato\",\"synced_restart_gateway_to_apply_the_new_build\":\"Sincronizzato — riavvia il gateway per applicare la nuova build.\",\"syncing\":\"Sincronizzazione in corso\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"Il gateway attivo su questa porta viene eseguito da questo checkout\",\"the_primary_checkout_is_on_branch_not_base\":\"Il checkout principale è su {{branch}}, non su {{base}}. Pull + Build rifiuterà di sincronizzare finché non torna su {{base}}.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"Il checkout principale da cui viene rilevata questa fleet\",\"tickets\":\"Ticket:\",\"toggle_log\":\"Attiva/disattiva il log\",\"toggle_provision_log\":\"Attiva/disattiva il log del provisioning\",\"token_mint_failed\":\"Generazione del token non riuscita\",\"total_disk_used_by_running_pod_homes\":\"Disco totale usato dagli home dei pod in esecuzione\",\"uncommitted_changes\":\"modifiche non committate\",\"undo_make_live_failed\":\"Impossibile riportare il dashboard alla versione precedente\",\"undo_to_name\":\"Torna a {{name}}\",\"up_to_date_with_main\":\"aggiornato rispetto a main\",\"updated\":\"Aggiornato\",\"verifying\":\"Verifica in corso\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"In attesa del nuovo processo del gateway. La pagina si ricarica automaticamente appena è attivo.\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktree\",\"worktrees_count\":\"Worktree ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"Worktree creati con un precedente nome del repository. Nascosti per impostazione predefinita; comunque coperti da \\\"Elimina i worktree uniti\\\".\"}}")
	},
	ja: {
		api: { "client": {
			"proxy_challenge_reload": "このブラウザータブを再読み込みしてください。サインインページが表示された場合は、アクセスプロキシのセッションが切れています。表示されない場合は、このダッシュボードの前段にあるプロキシまたはファイアウォールがリクエストを拒否しています。プロキシのログを確認するか、後でもう一度お試しください。",
			"server_temporarily_unavailable_http_status": "サーバーは一時的に利用できません（HTTP {{status}}）"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_other": "{{app}} は {{count}} 回連続で再起動に失敗し、数分ごとに再試行を続けます。今すぐ再試行するには、{{app}} を無効にしてから再度有効にしてください。",
				"restart_exhausted_title": "{{app}} の再起動が繰り返し失敗しています"
			},
			"devFleet": { "manifest": {
				"configuration_1": "アプリに Kiro Crew のチェックアウト先を指定します。PR 操作には認証済みの gh が必要です。ポッドには Linux の systemd --user、macOS の launchd、または Windows のタスクスケジューラーが必要で、事前にプロビジョニングする必要があります。",
				"description": "Kiro Crew自体の作業用コントロールパネル。すべての機能ワークツリーを、プルリクエスト状態、コミット数、ディスク使用量と一緒にリストして、それらを任意のポッドとして表示できます。独自のポートと独自のデータディレクトリを持つ完全なプレビューインスタンスなので、ライブゲートウェイに影響を与えずに未完成の変更をクリックして確認できます。また、メインのプルとリビルド、ブランチのリベース、ポッドログのストリーミング、作業がマージされたワークツリーの削除など、その周囲の作業を処理します。",
				"display_name": "Dev Fleet",
				"highlight_1": "任意のワークツリーを独自のポートとデータディレクトリ上の分離ポッドとして表示して、ライブゲートウェイに影響を与えない",
				"highlight_2": "フリートビューでブランチごとのPR状態、コミット数、ディスク使用量を表示",
				"highlight_3": "ダッシュボードを離れずにブランチを同期（メインをプルしてリビルド）またはリベース",
				"highlight_4": "「マージされたものをプルーン」は、破棄する代わりにコミットされていない作業またはトラッキングされていない作業を持つワークツリーの削除を拒否",
				"highlight_5": "UIからポッドログをストリーム配信してポッドアクセストークンを発行",
				"highlight_6": "Kiro Crew自体を開発している人向けに構築 — 日常の使用には不要",
				"highlight_7": "ポッドは Linux（systemd --user）、macOS（launchd）、Windows（タスクスケジューラー）で実行されます。ただし、macOS のポッドにはメモリ/CPU 上限が強制されません。Make Live はすべてのプラットフォームでポインタをステージし、自動再起動には systemd --user ユニットまたは macOS LaunchAgent が必要です。フリート表示、PR 状態、同期、リベース、削除はどのプラットフォームでも利用できます",
				"page_label": "Dev Fleet",
				"use_case_1": "稼働中のゲートウェイに影響を与えず、Kiro Crew の機能ワークツリーと分離されたプレビューポッドを運用します。"
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"アクション\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"最後のプル+ビルドを適用します。ダッシュボードは一時的に切断され、自動的に再接続されます。\",\"backend_unavailable\":\"バックエンド利用不可\",\"behind\":\"遅れている\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"は任意のワークツリーを分離された使い捨てゲートウェイとして\\n              起動し、稼働中のインスタンスに影響を与えずに機能ブランチを QA できます。\",\"branch\":\"ブランチ:\",\"build_finished_restarting_gateway\":\"ビルド完了 — ゲートウェイを再起動しています…\",\"build_pending\":\"ビルド保留中\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"ビルド保留中 — ゲートウェイを再起動して適用します（kirocrew restart）\",\"building\":\"ビルド中…\",\"built\":\"ビルド済み\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"ビルド完了。行メニューからこのブランチをQAするポッドをスピンアップしてください。\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"ビルド済み — ただしこのホストではポッドは実行できません。代わりに./dev-backend.shでプレビューしてください\",\"cancel\":\"キャンセル\",\"cancel_staged_cutover\":\"準備済みの切り替えをキャンセル\",\"cancel_staged_cutover_2\":\"準備済みの切り替えをキャンセルしますか？\",\"cannot_remove_the_main_worktree\":\"メインワークツリーは削除できません\",\"cannot_resolve_worktree_path_for_name\":\"{{name}}のワークツリーパスを解決できません\",\"close\":\"閉じる\",\"closed_has_unmerged_commits\":\"クローズ済み PR — main に存在しないコミットがあります\",\"closed_pr_not_on_main_hint\":\"クローズ済みで未マージの PR — 内容は main に存在しないため、削除すると完全に失われます。選択する前に確認してください。\",\"collapse\":\"折りたたむ\",\"commits\":\"コミット:\",\"commits_behind_main\":\"メインより遅れているコミット\",\"commits_behind_main_2_other\":\"{{count}}コミットメインより遅れています\",\"confirm\":\"確認\",\"conflicts_aborted\":\"競合 — 中止\",\"created_recently\":\"最近作成\",\"current_step\":\"現在のステップ\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"切り替え準備完了：ゲートウェイの次回起動時にこのワークツリーがライブになります。完了するには `{{cmd}}` を実行するか、この行のメニュー → 準備済みの切り替えをキャンセル で取り消せます。それまでゲートウェイは以前のチェックアウトで動作し続けます。\",\"cutover_staged_run_the_restart_command_to_finish\":\"切り替えの準備が完了しました。次回ゲートウェイを起動すると、このワークツリーがライブになります。完了するには `{{cmd}}` を実行してください。それまでは、ゲートウェイは以前のチェックアウトで動作し続けます。\",\"delete_anyway\":\"とにかく削除\",\"design_docs\":\"デザインドキュメント:\",\"dev_fleet\":\"Dev Fleet\",\"discard_untracked_files\":\"追跡されていないファイル（{{count}} 件）も破棄されます。次を含みます: {{files}}\",\"discovery_error\":\"検出エラー\",\"disk\":\"ディスク:\",\"disk_usage_unavailable\":\"ディスク使用量を取得できません\",\"disk_worktrees\":\"ディスク（ワークツリー）\",\"dismiss\":\"却下\",\"dismiss_sync_status\":\"同期ステータスを却下\",\"each_row_below_is_a_git_worktree_discovered_from\":\"以下の各行は、メインチェックアウトから発見されたGitワークツリーです。使用\",\"empty_worktree_cannot_be_undone\":\"空のワークツリー。元に戻せません。\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"メインチェックアウトのすべてのGitワークツリー。プル+ビルドはメインを同期します。ポッドはワークツリーからブートされた独立したゲートウェイです。\",\"expand\":\"展開\",\"failed\":\"失敗\",\"failed_to_load_logs\":\"ログの読み込みに失敗しました\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"最新のメインをフェッチして再生します。ダーティな場合は拒否されます。競合でリベースが中止されます。\",\"filter_worktrees\":\"ワークツリーをフィルター…\",\"filter_worktrees_2\":\"ワークツリーをフィルター\",\"finished\":\"完了\",\"force_remove\":\"{{name}} を強制削除\",\"force_remove_confirm_desc_other\":\"{{count}} 件のワークツリーに未マージまたは未コミットの作業があります。削除するとローカルの変更がすべて永久に失われます。元に戻せません。\",\"force_remove_confirm_title\":\"ワークツリーを強制削除しますか？\",\"force_remove_warning\":\"選択したワークツリーには未マージの作業があります — 削除は永久的で、元に戻せません。\",\"gateway_did_not_come_back_within_60s_reload_the\":\"ゲートウェイが60秒以内に復帰しませんでした — ページを手動で再度読み込むか、`kirocrew logs`を確認してください。\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"ゲートウェイが同期中に再起動しました — 実行が失われました。Gitの状態を確認して、プル+ビルドを再実行してください\",\"git_status_failed\":\"Gitステータス失敗\",\"has_unmerged_work_removing_deletes_permanently\":\"マージされていない作業があります — 削除が永久に削除されます。\",\"hide_legacy_worktrees\":\"旧版ワークツリー {{n}} 件を非表示\",\"hide_logs\":\"ログを非表示\",\"issues\":\"問題:\",\"keep_cutover\":\"切り替えを維持\",\"keeps_name_the_live_target_and_discards_the_stag\":\"「{{name}}」 がライブ対象のままとなり、「{{staged}}」 への準備済みの切り替えは破棄されます。何も再起動されません — ゲートウェイは現在のコードで動作し続けます。\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"ライブ中のチェックアウトがライブ対象のままとなり、{{staged}} への準備済みの切り替えは破棄されます（何も再起動されません）\",\"keeps_this_checkout_the_live_target_and_discards\":\"このチェックアウトがライブ対象のままとなり、「{{staged}}」 への準備済みの切り替えは破棄されます（何も再起動されません）\",\"kept\":\"保持されました\",\"kept_discard_untracked_hint\":\"追跡されていない一時ファイルだけで保留になっている行: 1 つチェックすると、その行に表示されているファイルが破棄されます。\",\"kept_force_hint\":\"チェックで強制削除 — 未マージの作業が削除されます。\",\"last_commit_activity\":\"最後のコミットアクティビティ\",\"legacy_worktrees_hidden_show\":\"旧版ワークツリー {{n}} 件を非表示中 · 表示\",\"live\":\"ライブ\",\"live_checkout_changed_to_name\":\"ダッシュボードは現在「{{name}}」を使用しています。\",\"live_state_unknown\":\"ライブ状態を取得できません\",\"live_state_unknown_help\":\"ゲートウェイがどのチェックアウトがライブ（ゲートウェイ自体が実行されているチェックアウト）またはステージ済みかを報告できなかったため、ライブとして表示されている行はありません。これは「不明」であり「なし」ではありません。チェックアウトをライブにする前に、エージェントに質問してください。\",\"live_unverified\":\"ライブ？\",\"load_pod_logs\":\"ポッドログを読み込む\",\"loading\":\"読み込み中…\",\"log\":\"ログ ▴\",\"log_2\":\"ログ ▾\",\"main\":\"· main\",\"make_live\":\"ライブにする\",\"make_live_failed\":\"ライブ化に失敗しました\",\"make_name_live\":\"「{{name}}」をライブにしますか？\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"メインチェックアウトのGitワークツリーを管理します — 同期、リベース、QAポッド、クリーンアップを1か所で行います。\",\"marked_live_but_this_install_cant_confirm_it\":\"パッケージ版のインストール: このチェックアウトが実行中か確認できません。\",\"more_actions\":\"その他のアクション\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"機能ブランチを最新のメインに移動し、\",\"needs_provision\":\"プロビジョニングが必要\",\"no_candidates_found\":\"候補が見つかりません。\",\"no_checkout_found\":\"{{productName}} のチェックアウトが見つかりません\",\"no_checkout_found_action\":\"{{productName}} データディレクトリ（既定では ~/.kiro/crew）の config.json に dev_fleet.repo_path を追加すると、このページは次の更新時にそのパスを読み込みます。下記の環境変数でも設定できますが、起動後に設定された変数は実行中のゲートウェイからは見えないため、その方法では再起動が必要です。\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/チェックアウトへのパス\",\"no_checkout_found_help\":\"Dev Fleet は {{productName}} ソースチェックアウトの git worktree を管理します。プロジェクトディレクトリ、このダッシュボードを提供しているチェックアウト、一般的なクローン先のいずれにも見つかりませんでした。\",\"no_commits_stale\":\"コミットなし、古い\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"venv/UIビルドはまだありません — プロビジョニングはこのワークツリーをビルドするため、ポッドが実行可能です\",\"no_worktrees_found\":\"ワークツリーが見つかりません\",\"not_built\":\"ビルドされていません\",\"nothing_selected\":\"何も選択されていません\",\"nothing_to_prune\":\"削減するものはありません\",\"nothing_under_the_worktrees_root_yet\":\"ワークツリーのルートの下にまだ何もありません。\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"メイン行で、origin から fast-forward して再ビルド\\n              （その後、ゲートウェイを再起動して適用）。\",\"open\":\"開く\",\"orphan_pods_label\":\"孤立した Pod ホーム: {{value}}\",\"parked_on_branch\":\"{{branch}} に留まっています\",\"pending\":\"保留中\",\"pod\":\"pod\",\"pod_2\":\"ポッド\",\"pod_and_make_live_actions_are_hidden_everything\":\"ポッド操作は非表示になります。このページの他の機能はすべて正常に動作します。\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"Pod の CPU 使用率\",\"pod_home_disk\":\"Pod ホームのディスク: {{value}}\",\"pod_home_size\":\"Pod ホーム: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"稼働中の Pod がないままディスクに残る Pod ホーム\",\"pod_memory\":\"メモリ: {{value}}\",\"pod_memory_of_ceiling\":\"cgroup 上限に対する Pod のメモリ使用量\",\"pod_running_on\":\"ポッド：実行中 :\",\"pod_sick\":\"ポッド不調\",\"pod_start_failed\":\"ポッド起動失敗\",\"pod_task_chip_other\":\"{{n}} 件のタスク\",\"pod_task_count\":\"Pod のタスク（プロセス/スレッド）数\",\"pod_tasks\":\"タスク: {{value}}\",\"pod_up\":\"ポッド起動\",\"pod_up_name\":\"ポッド起動：{{name}}\",\"pods_are_unavailable_on_this_host\":\"このホストではポッドは利用できません。\",\"pr\":\"PR：\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR はクローズ済み — ブランチに新しいコミットがあります\",\"pr_closed_but_verification_unavailable_retry\":\"PR はクローズ済みですが検証利用不可 — 再試行\",\"pr_closed_not_on_main\":\"PR はクローズ済み — main に存在しません\",\"pr_closed_uncommitted_changes\":\"PR はクローズ済み — 未コミットの変更あり\",\"pr_merged\":\"PR マージ済み\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR はマージ済みですが、マージ後に新しいコミットがプッシュされました\",\"pr_merged_but_verification_unavailable_retry\":\"PR マージ済みですが検証利用不可 — 再試行\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR マージ済み — 削除可能。`git worktree remove` を実行します。元に戻せません。\",\"pr_merged_uncommitted_changes\":\"PR マージ済み、未コミット変更あり\",\"pr_open_or_unmerged_commits\":\"PR オープン または アンマージコミット\",\"pr_state_closed\":\"クローズ\",\"pr_state_merged\":\"マージ済み\",\"pr_state_open\":\"オープン\",\"protected_worktree\":\"保護対象 — メインまたは現在稼働中\",\"provision\":\"プロビジョニング\",\"provision_failed\":\"プロビジョニング失敗\",\"provision_failed_exit_code\":\"プロビジョニング失敗（終了コード {{code}}）\",\"provision_failed_status\":\"プロビジョニング失敗（{{status}}）\",\"provision_failed_to_start\":\"プロビジョニング開始失敗\",\"provision_polling_timed_out_check_pod_logs\":\"プロビジョニングポーリングがタイムアウト — ポッドログを確認してください\",\"provision_timed_out\":\"プロビジョニングタイムアウト\",\"provisioned\":\"プロビジョニング済み\",\"provisioning\":\"プロビジョニング中\",\"prune\":\"削除\",\"prune_complete\":\"削除完了\",\"prune_failed_count_other\":\"{{count}} 件のワークツリーを削除できませんでした\",\"prune_failed_to_start\":\"削除開始失敗\",\"prune_merged\":\"マージ済み削除\",\"prune_preview_failed\":\"削除プレビュー失敗\",\"prune_worktrees\":\"ワークツリーを削除\",\"pruned_worktrees_other\":\"{{count}} 件のワークツリーを削除しました\",\"pruned_worktrees_some_failed_other\":\"{{count}} 件のワークツリーを削除しました（{{failed}} 件失敗）\",\"pruning_worktrees\":\"ワークツリー削除中\",\"pull_build\":\"プル + ビルド\",\"pull_build_2\":\"プル+ビルド\",\"pull_build_failed\":\"プル+ビルド失敗\",\"pull_build_failed_exit_code_detail\":\"プル+ビルド失敗（終了コード {{code}}）：{{detail}}\",\"pull_build_failed_to_start\":\"プル+ビルド開始失敗\",\"pull_build_main\":\"main をプル + ビルド\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"ベースブランチをプルして再ビルド（約 6 分）。再起動は しません。\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"ベースブランチをプルしてリビルド（約6分）し、ゲートウェイを自動的に再起動します。ビルドが完了するまでこのページを開いたままにしてください。\",\"purpose\":\"目的：\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA ポッドは実行中ですがヘルスチェックに失敗しています\",\"qa_pod_is_running_click_open_to_use_it\":\"QA ポッドは実行中 — 「開く」をクリックして使用してください\",\"qa_video\":\"QA + ビデオ\",\"rebase\":\"リベース\",\"rebase_conflicts\":\"リベース競合\",\"rebase_failed\":\"リベース失敗\",\"rebase_name\":\"「{{name}}」をリベースしますか？\",\"rebase_onto_main\":\"ベースブランチにリベース\",\"rebased_head\":\"リベース済み（HEAD {{head}}）\",\"refresh\":\"更新\",\"refresh_fleet\":\"フリートを更新\",\"remove\":\"削除\",\"remove_closed_pr\":\"削除 — クローズ済み PR（main に存在しません）\",\"remove_name\":\"「{{name}}」を削除しますか？\",\"remove_selected\":\"選択項目を削除\",\"removed\":\"削除済み\",\"removed_name\":\"{{name}} を削除しました\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"ワークツリーを削除してポッドを停止します。元に戻せません。\",\"removing\":\"削除中\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"ライブゲートウェイをこのワークツリーに指し直します（ゲートウェイを再起動します）\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"ライブゲートウェイを main に指し直します（ゲートウェイを再起動します）\",\"restart\":\"再起動\",\"restart_failed\":\"再起動失敗\",\"restart_gateway\":\"ゲートウェイを再起動\",\"restart_gateway_2\":\"ゲートウェイを再起動しますか？\",\"restart_gateway_to_apply_the_new_build\":\"新しいビルドを適用するためにゲートウェイを再起動してください\",\"restart_pending\":\"再起動待ち\",\"restart_pod\":\"ポッドを再起動\",\"restarted_name\":\"{{name}} を再起動しました\",\"restarting_completes_the_pending_cutover_boots\":\"再起動すると保留中の切り替えが完了します：ゲートウェイは現在のチェックアウトではなく「{{staged}}」で起動します。ダッシュボードは一時的に切断され、自動的に再接続されます。取り消す場合は、準備済みの切り替えをキャンセル を使用してください。\",\"restarting_reconnecting\":\"再起動中 — 再接続中…\",\"rows_count_other\":\"{{n}} 行\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} 行\",\"running_pods\":\"実行中のポッド\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"PR がすでにマージ済みのワークツリーを安全に削除します。\",\"scanning_merged\":\"マージ済みをスキャン中…\",\"select\":\"{{name}} を選択\",\"sort_behind\":\"ソート：遅延\",\"sort_name\":\"ソート：名前\",\"sort_recent\":\"ソート：最近\",\"sort_status\":\"ソート：ステータス\",\"sort_worktrees\":\"ワークツリーをソート\",\"spin_up_pod\":\"ポッドを起動\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"`{{cmd}}` を実行するまで、ダッシュボードは現在のバージョンを使い続けます。再起動後は同じ URL とデータで「{{name}}」を使用します。このページは自動的に再接続しません。\",\"stages_the_code_behind_the_live_dashboard_manual\":\"このワークツリーをライブターゲット（同じポート、同じデータ）として準備します。Dev Fleet からこのゲートウェイを再起動することはできないため、`{{cmd}}` を自分で実行した時点で切り替わります。このページは自動的には再接続しません。ワークツリーのプロビジョニングとビルドが完了していない場合は拒否されます。\",\"start\":\"開始\",\"starting\":\"起動中…\",\"starting_pod_for_name_can_take_1_min\":\"{{name}} のポッドを起動中…（約 1 分かかる場合があります）\",\"stop_pod\":\"ポッドを停止\",\"stopped_name\":\"{{name}} を停止しました\",\"stopping_pod\":\"ポッド停止中\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"ライブダッシュボードの背後にあるコードをこのワークツリーにスワップします（同じポート、同じデータ）。ゲートウェイが再起動され、このページが自動的に再接続します。ワークツリーがプロビジョニングおよびビルドされている場合を除き、拒否されます。\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"ダッシュボードを「{{name}}」に戻します（URL とデータは同じです）。ダッシュボードが一時的に再起動し、このページは自動的に再接続します。\",\"sync_progress\":\"同期進捗\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"同期実行が失われました（同期中にゲートウェイが再起動されました）。プル+ビルドを再実行してください。\",\"synced\":\"同期済み\",\"synced_restart_gateway_to_apply_the_new_build\":\"同期済み — 新しいビルドを適用するためにゲートウェイを再起動してください。\",\"syncing\":\"同期中\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"このポート上のライブゲートウェイはこのチェックアウトから実行されます\",\"the_primary_checkout_is_on_branch_not_base\":\"プライマリチェックアウトは {{base}} ではなく {{branch}} にあります。{{base}} に戻すまで、プル + ビルドは同期を拒否します。\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"このフリートが発見される基本チェックアウト\",\"tickets\":\"チケット：\",\"toggle_log\":\"ログを切り替え\",\"toggle_provision_log\":\"プロビジョニングログを切り替え\",\"token_mint_failed\":\"トークンミント失敗\",\"total_disk_used_by_running_pod_homes\":\"実行中の Pod ホームが使用するディスク合計\",\"uncommitted_changes\":\"未コミット変更\",\"undo_make_live_failed\":\"ダッシュボードを元に戻せませんでした\",\"undo_to_name\":\"「{{name}}」に戻す\",\"up_to_date_with_main\":\"main と同期\",\"updated\":\"更新済み\",\"verifying\":\"検証中\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"新しいゲートウェイプロセスを待機中。ゲートウェイが起動するとページが自動的に再ロードされます。\",\"worktree\":\"ワークツリー\",\"worktrees\":\"ワークツリー\",\"worktrees_count\":\"ワークツリー（{{count}}）\",\"worktrees_created_under_a_previous_repository_na\":\"以前のリポジトリ名の下で作成されたワークツリー。デフォルトでは非表示。マージ済み削除の対象です。\"}}")
	},
	ko: {
		api: { "client": {
			"proxy_challenge_reload": "이 브라우저 탭을 다시 로드하세요. 로그인 페이지가 나타나면 액세스 프록시 세션이 만료된 것입니다. 그렇지 않다면 이 대시보드 앞단의 프록시나 방화벽이 요청을 거부한 것이니, 프록시 로그를 확인하거나 나중에 다시 시도하세요.",
			"server_temporarily_unavailable_http_status": "서버를 일시적으로 사용할 수 없습니다 (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_other": "{{app}}이(가) 연속 {{count}}회 다시 시작에 실패했으며 몇 분마다 계속 재시도합니다. 지금 다시 시도하려면 {{app}}을(를) 비활성화했다가 다시 활성화하세요.",
				"restart_exhausted_title": "{{app}}이(가) 계속 다시 시작하지 못하고 있습니다"
			},
			"devFleet": { "manifest": {
				"configuration_1": "앱에 Kiro Crew 체크아웃 경로를 지정하세요. PR 작업에는 인증된 gh가 필요합니다. 포드에는 Linux의 systemd --user, macOS의 launchd 또는 Windows의 작업 스케줄러가 필요하며 먼저 프로비저닝해야 합니다.",
				"description": "Kiro Crew 자체를 개발하기 위한 제어판입니다. 모든 기능 워크트리를 풀 리퀘스트 상태, 커밋 수, 디스크 사용량과 함께 나열하고, 그중 어느 것이든 포드로 띄울 수 있습니다. 포드는 자체 포트와 자체 데이터 디렉터리를 갖는 완전한 미리 보기 인스턴스이므로, 실행 중인 게이트웨이를 건드리지 않고 완성되지 않은 변경을 직접 눌러 볼 수 있습니다. main 풀 및 재빌드, 브랜치 리베이스, 포드 로그 스트리밍, 이미 병합된 워크트리 정리 같은 주변 작업도 함께 처리합니다.",
				"display_name": "Dev Fleet",
				"highlight_1": "어떤 워크트리든 자체 포트와 데이터 디렉터리를 쓰는 격리된 포드로 띄워, 실행 중인 게이트웨이는 그대로 둡니다",
				"highlight_2": "브랜치별 PR 상태, 커밋 수, 디스크 사용량을 보여 주는 플릿 화면",
				"highlight_3": "대시보드를 벗어나지 않고 브랜치를 동기화(main 풀 후 재빌드)하거나 리베이스",
				"highlight_4": "‘병합된 항목 정리’는 커밋되지 않았거나 추적되지 않는 작업이 있는 워크트리를 버리지 않고 삭제를 거부합니다",
				"highlight_5": "UI에서 포드 로그를 스트리밍하고 포드 액세스 토큰을 발급",
				"highlight_6": "Kiro Crew 자체를 개발하는 사람을 위해 만들었습니다 — 일상적인 사용에는 필요하지 않습니다",
				"highlight_7": "포드는 Linux(systemd --user), macOS(launchd), Windows(작업 스케줄러)에서 실행됩니다 — 다만 macOS 포드에는 메모리/CPU 상한이 적용되지 않습니다. Make Live는 모든 플랫폼에서 포인터를 준비하고, 자동 재시작에는 systemd --user 유닛이나 macOS LaunchAgent가 필요하며, 플릿 화면, PR 상태, 동기화, 리베이스, 정리는 모든 플랫폼에서 동작합니다",
				"page_label": "Dev Fleet",
				"use_case_1": "실행 중인 게이트웨이는 그대로 둔 채 Kiro Crew 기능 워크트리와 격리된 미리 보기 포드를 운영합니다."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"작업\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"마지막 Pull+Build를 적용합니다. 대시보드는 잠시 연결이 끊긴 뒤 자동으로 다시 연결됩니다.\",\"backend_unavailable\":\"백엔드를 사용할 수 없음\",\"behind\":\"뒤처짐\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"어떤 워크트리든 격리된 일회용\\n 게이트웨이로 부팅하므로 운영 중인 인스턴스를 건드리지 않고 기능 브랜치를 QA할 수 있습니다.\",\"branch\":\"브랜치:\",\"build_finished_restarting_gateway\":\"빌드 완료 — 게이트웨이를 재시작하는 중…\",\"build_pending\":\"빌드 대기 중\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"빌드 대기 중 — 적용하려면 게이트웨이를 재시작하세요 (kirocrew restart)\",\"building\":\"빌드 중…\",\"built\":\"빌드됨\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"빌드 완료 — 행 메뉴에서 포드를 띄워 이 브랜치를 QA하세요\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"빌드됨 — 다만 이 호스트에서는 포드를 실행할 수 없습니다. 대신 ./dev-backend.sh로 미리 보세요\",\"cancel\":\"취소\",\"cancel_staged_cutover\":\"준비된 전환 취소\",\"cancel_staged_cutover_2\":\"준비된 전환을 취소할까요?\",\"cannot_remove_the_main_worktree\":\"main 워크트리는 삭제할 수 없습니다\",\"cannot_resolve_worktree_path_for_name\":\"{{name}}의 워크트리 경로를 확인할 수 없습니다\",\"close\":\"닫기\",\"closed_has_unmerged_commits\":\"닫힌 PR — main에 없는 커밋이 있음\",\"closed_pr_not_on_main_hint\":\"닫혔고 병합되지 않은 PR — 내용이 main에 없으므로 제거하면 영구적으로 삭제됩니다. 선택하기 전에 확인하세요.\",\"collapse\":\"접기\",\"commits\":\"커밋:\",\"commits_behind_main\":\"main보다 뒤처진 커밋\",\"commits_behind_main_2_other\":\"main보다 {{count}}개 커밋 뒤처짐\",\"confirm\":\"확인\",\"conflicts_aborted\":\"충돌 — 중단됨\",\"created_recently\":\"최근 생성됨\",\"current_step\":\"현재 단계\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"전환 준비 완료: 게이트웨이가 다음에 시작될 때 이 워크트리가 라이브로 전환됩니다. 마무리하려면 `{{cmd}}`을(를) 실행하고, 되돌리려면 이 행의 메뉴 → 준비된 전환 취소를 사용하세요. 그전까지 게이트웨이는 이전 체크아웃으로 계속 실행됩니다.\",\"cutover_staged_run_the_restart_command_to_finish\":\"전환 준비 완료: 게이트웨이가 다음에 시작될 때 이 워크트리가 라이브로 전환됩니다. 마무리하려면 `{{cmd}}`을(를) 실행하세요. 그전까지 게이트웨이는 이전 체크아웃으로 계속 실행됩니다.\",\"delete_anyway\":\"그래도 삭제\",\"design_docs\":\"디자인 문서:\",\"dev_fleet\":\"Dev Fleet\",\"discard_untracked_files\":\"추적되지 않는 파일({{count}}개)도 삭제됩니다. 다음을 포함합니다: {{files}}\",\"discovery_error\":\"탐색 오류\",\"disk\":\"디스크:\",\"disk_usage_unavailable\":\"디스크 사용량을 확인할 수 없습니다\",\"disk_worktrees\":\"디스크(워크트리)\",\"dismiss\":\"닫기\",\"dismiss_sync_status\":\"동기화 상태 닫기\",\"each_row_below_is_a_git_worktree_discovered_from\":\"아래 각 행은 main 체크아웃에서 탐색된 Git 워크트리입니다. 사용\",\"empty_worktree_cannot_be_undone\":\"빈 워크트리입니다. 되돌릴 수 없습니다.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"main 체크아웃의 모든 Git 워크트리입니다. 풀+빌드는 main을 동기화하고, 포드는 워크트리에서 부팅된 독립 게이트웨이입니다.\",\"expand\":\"펼치기\",\"failed\":\"실패\",\"failed_to_load_logs\":\"로그를 불러오지 못했습니다\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"최신 main을 가져와 재적용합니다. 변경 사항이 있으면 거부되며, 충돌 시 리베이스가 중단됩니다.\",\"filter_worktrees\":\"워크트리 필터…\",\"filter_worktrees_2\":\"워크트리 필터\",\"finished\":\"완료됨\",\"force_remove\":\"{{name}} 강제 제거\",\"force_remove_confirm_desc_other\":\"{{count}}개의 워크트리에 병합되지 않았거나 커밋되지 않은 작업이 있습니다. 삭제하면 모든 로컬 변경 사항이 영구적으로 삭제됩니다. 되돌릴 수 없습니다.\",\"force_remove_confirm_title\":\"워크트리를 강제로 삭제하시겠습니까?\",\"force_remove_warning\":\"선택한 워크트리에 병합되지 않은 작업이 있습니다 — 삭제는 영구적이며 되돌릴 수 없습니다.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"게이트웨이가 60초 이내에 복귀하지 않았습니다 — 페이지를 직접 새로 고치거나 `kirocrew logs`를 확인하세요.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"동기화 중 게이트웨이가 재시작되어 실행이 유실되었습니다. Git 상태를 확인하고 풀+빌드를 다시 실행하세요\",\"git_status_failed\":\"git status 실패\",\"has_unmerged_work_removing_deletes_permanently\":\"병합되지 않은 작업이 있습니다 — 삭제하면 영구적으로 사라집니다.\",\"hide_legacy_worktrees\":\"레거시 워크트리 {{n}}개 숨기기\",\"hide_logs\":\"로그 숨기기\",\"issues\":\"이슈:\",\"keep_cutover\":\"전환 유지\",\"keeps_name_the_live_target_and_discards_the_stag\":\"‘{{name}}’이(가) 라이브 대상으로 유지되고 ‘{{staged}}’(으)로 준비된 전환은 취소됩니다. 아무것도 재시작되지 않습니다 — 게이트웨이는 현재 코드로 계속 실행됩니다.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"라이브 체크아웃이 라이브 대상으로 유지되고 {{staged}}(으)로 준비된 전환은 취소됩니다(아무것도 재시작되지 않음)\",\"keeps_this_checkout_the_live_target_and_discards\":\"이 체크아웃이 라이브 대상으로 유지되고 ‘{{staged}}’(으)로 준비된 전환은 취소됩니다(아무것도 재시작되지 않음)\",\"kept\":\"유지됨\",\"kept_discard_untracked_hint\":\"추적되지 않는 임시 파일 때문에만 보류된 행: 하나를 체크하면 해당 행에 표시된 파일이 삭제됩니다.\",\"kept_force_hint\":\"체크하면 강제 제거 — 병합되지 않은 작업이 삭제됩니다.\",\"last_commit_activity\":\"마지막 커밋 활동\",\"legacy_worktrees_hidden_show\":\"레거시 워크트리 {{n}}개 숨김 · 표시\",\"live\":\"라이브\",\"live_checkout_changed_to_name\":\"대시보드가 이제 ‘{{name}}’을(를) 사용합니다.\",\"live_state_unknown\":\"라이브 상태를 확인할 수 없음\",\"live_state_unknown_help\":\"게이트웨이가 어떤 체크아웃이 라이브(게이트웨이 자체가 실행되는 체크아웃) 또는 스테이징 상태인지 보고하지 못해 라이브로 표시된 행이 없습니다. 이는 '없음'이 아니라 '알 수 없음'입니다. 체크아웃을 라이브로 전환하기 전에 에이전트에게 문의하세요.\",\"live_unverified\":\"라이브?\",\"load_pod_logs\":\"포드 로그 불러오기\",\"loading\":\"불러오는 중…\",\"log\":\"로그 ▴\",\"log_2\":\"로그 ▾\",\"main\":\"· main\",\"make_live\":\"라이브로 전환\",\"make_live_failed\":\"라이브 전환 실패\",\"make_name_live\":\"‘{{name}}’을(를) 라이브로 전환할까요?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"main 체크아웃의 Git 워크트리를 관리합니다 — 동기화, 리베이스, QA 포드, 정리를 한곳에서.\",\"marked_live_but_this_install_cant_confirm_it\":\"패키지 설치본: 이 체크아웃이 실행 중인지 확인할 수 없습니다.\",\"more_actions\":\"추가 작업\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"기능 브랜치를 최신 main 위로 옮기며,\",\"needs_provision\":\"프로비저닝 필요\",\"no_candidates_found\":\"후보를 찾을 수 없습니다.\",\"no_checkout_found\":\"{{productName}} 체크아웃을 찾을 수 없습니다\",\"no_checkout_found_action\":\"{{productName}} 데이터 디렉터리(기본값 ~/.kiro/crew)의 config.json에 dev_fleet.repo_path를 추가하면 이 페이지가 다음 새로 고침에서 해당 경로를 읽습니다. 아래 환경 변수로도 설정할 수 있지만, 실행 중인 게이트웨이는 시작 후에 설정된 변수를 볼 수 없으므로 그 방법은 다시 시작이 필요합니다.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/체크아웃/경로\",\"no_checkout_found_help\":\"Dev Fleet은 {{productName}} 소스 체크아웃의 git worktree를 관리합니다. 프로젝트 디렉터리, 이 대시보드를 제공하는 체크아웃, 일반적인 클론 위치에서 찾을 수 없습니다.\",\"no_commits_stale\":\"커밋 없음, 오래됨\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"venv/UI 빌드가 아직 없습니다 — 프로비저닝이 이 워크트리를 빌드해 포드를 실행할 수 있게 합니다\",\"no_worktrees_found\":\"워크트리를 찾을 수 없습니다\",\"not_built\":\"빌드되지 않음\",\"nothing_selected\":\"선택된 항목 없음\",\"nothing_to_prune\":\"정리할 항목 없음\",\"nothing_under_the_worktrees_root_yet\":\"워크트리 루트 아래에 아직 아무것도 없습니다.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"main 행에서 origin으로부터 fast-forward한 뒤 다시 빌드합니다\\n (적용하려면 게이트웨이를 재시작하세요).\",\"open\":\"열기\",\"orphan_pods_label\":\"고아 파드 홈: {{value}}\",\"parked_on_branch\":\"{{branch}}에 머물러 있습니다\",\"pending\":\"대기 중\",\"pod\":\"포드\",\"pod_2\":\"포드\",\"pod_and_make_live_actions_are_hidden_everything\":\"포드 작업은 숨겨지며, 이 페이지의 나머지 기능은 정상 작동합니다.\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"파드 CPU 사용량\",\"pod_home_disk\":\"파드 홈 디스크: {{value}}\",\"pod_home_size\":\"파드 홈: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"활성 파드 없이 디스크에 남은 파드 홈\",\"pod_memory\":\"메모리: {{value}}\",\"pod_memory_of_ceiling\":\"cgroup 상한 대비 파드 메모리 사용량\",\"pod_running_on\":\"포드: 실행 중 :\",\"pod_sick\":\"포드 이상\",\"pod_start_failed\":\"포드 시작 실패\",\"pod_task_chip_other\":\"작업 {{n}}개\",\"pod_task_count\":\"파드 작업(프로세스/스레드) 수\",\"pod_tasks\":\"작업: {{value}}\",\"pod_up\":\"포드 실행 중\",\"pod_up_name\":\"포드 실행: {{name}}\",\"pods_are_unavailable_on_this_host\":\"이 호스트에서는 포드를 사용할 수 없습니다.\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR 닫힘 — 브랜치에 더 새로운 커밋이 있음\",\"pr_closed_but_verification_unavailable_retry\":\"PR 닫힘, 검증 불가 — 다시 시도하세요\",\"pr_closed_not_on_main\":\"PR 닫힘 — main에 없음\",\"pr_closed_uncommitted_changes\":\"PR 닫힘 — 커밋되지 않은 변경 사항\",\"pr_merged\":\"PR 병합됨\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR은 병합되었지만 병합 후 새 커밋이 푸시되었습니다\",\"pr_merged_but_verification_unavailable_retry\":\"PR 병합됨, 검증 불가 — 다시 시도하세요\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR 병합됨 — 삭제해도 안전합니다. `git worktree remove`를 실행합니다. 되돌릴 수 없습니다.\",\"pr_merged_uncommitted_changes\":\"PR 병합됨, 커밋되지 않은 변경 있음\",\"pr_open_or_unmerged_commits\":\"PR 열림 또는 병합되지 않은 커밋\",\"pr_state_closed\":\"닫힘\",\"pr_state_merged\":\"병합됨\",\"pr_state_open\":\"열림\",\"protected_worktree\":\"보호됨 — main 또는 현재 실행 중\",\"provision\":\"프로비저닝\",\"provision_failed\":\"프로비저닝 실패\",\"provision_failed_exit_code\":\"프로비저닝 실패(종료 코드 {{code}})\",\"provision_failed_status\":\"프로비저닝 실패({{status}})\",\"provision_failed_to_start\":\"프로비저닝을 시작하지 못했습니다\",\"provision_polling_timed_out_check_pod_logs\":\"프로비저닝 폴링 시간 초과 — 포드 로그를 확인하세요\",\"provision_timed_out\":\"프로비저닝 시간 초과\",\"provisioned\":\"프로비저닝됨\",\"provisioning\":\"프로비저닝 중\",\"prune\":\"정리\",\"prune_complete\":\"정리 완료\",\"prune_failed_count_other\":\"정리 실패: {{count}}개\",\"prune_failed_to_start\":\"정리를 시작하지 못했습니다\",\"prune_merged\":\"병합된 항목 정리\",\"prune_preview_failed\":\"정리 미리보기 실패\",\"prune_worktrees\":\"워크트리 정리\",\"pruned_worktrees_other\":\"워크트리 {{count}}개를 정리했습니다\",\"pruned_worktrees_some_failed_other\":\"워크트리 {{count}}개를 정리했습니다({{failed}}개 실패)\",\"pruning_worktrees\":\"워크트리 정리 중\",\"pull_build\":\"풀 + 빌드\",\"pull_build_2\":\"풀+빌드\",\"pull_build_failed\":\"풀+빌드 실패\",\"pull_build_failed_exit_code_detail\":\"풀+빌드 실패(종료 코드 {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"풀+빌드를 시작하지 못했습니다\",\"pull_build_main\":\"main 풀 + 빌드\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"베이스 브랜치를 풀하고 다시 빌드합니다(약 6분). 재시작하지는 않습니다.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"베이스 브랜치를 풀하고 리빌드(~6분)한 뒤 게이트웨이를 자동으로 재시작합니다. 빌드가 완료될 때까지 이 페이지를 열어 두세요.\",\"purpose\":\"목적:\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA 포드는 실행 중이지만 상태 검사에 실패하고 있습니다\",\"qa_pod_is_running_click_open_to_use_it\":\"QA 포드가 실행 중입니다 — ‘열기’를 클릭해 사용하세요\",\"qa_video\":\"QA + 영상\",\"rebase\":\"리베이스\",\"rebase_conflicts\":\"리베이스 충돌\",\"rebase_failed\":\"리베이스 실패\",\"rebase_name\":\"‘{{name}}’을(를) 리베이스할까요?\",\"rebase_onto_main\":\"베이스 브랜치 위로 리베이스\",\"rebased_head\":\"리베이스됨(HEAD {{head}})\",\"refresh\":\"새로 고침\",\"refresh_fleet\":\"플릿 새로 고침\",\"remove\":\"삭제\",\"remove_closed_pr\":\"제거 — 닫힌 PR (main에 없음)\",\"remove_name\":\"‘{{name}}’을(를) 제거하시겠습니까?\",\"remove_selected\":\"선택 항목 삭제\",\"removed\":\"삭제됨\",\"removed_name\":\"{{name}}을(를) 삭제했습니다\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"워크트리를 삭제하고 포드를 중지합니다. 되돌릴 수 없습니다.\",\"removing\":\"삭제 중\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"라이브 게이트웨이를 이 워크트리로 지정합니다(게이트웨이가 재시작됩니다)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"라이브 게이트웨이를 다시 main으로 지정합니다(게이트웨이가 재시작됩니다)\",\"restart\":\"재시작\",\"restart_failed\":\"재시작 실패\",\"restart_gateway\":\"게이트웨이 재시작\",\"restart_gateway_2\":\"게이트웨이를 재시작할까요?\",\"restart_gateway_to_apply_the_new_build\":\"새 빌드를 적용하려면 게이트웨이를 재시작하세요\",\"restart_pending\":\"재시작 대기 중\",\"restart_pod\":\"포드 재시작\",\"restarted_name\":\"{{name}}을(를) 재시작했습니다\",\"restarting_completes_the_pending_cutover_boots\":\"재시작하면 대기 중인 전환이 완료됩니다: 게이트웨이는 현재 체크아웃이 아닌 '{{staged}}'(으)로 다시 시작됩니다. 대시보드가 잠시 연결이 끊겼다가 자동으로 다시 연결됩니다. 되돌리려면 준비된 전환 취소를 사용하세요.\",\"restarting_reconnecting\":\"재시작 중 — 다시 연결하는 중…\",\"rows_count_other\":\"{{n}}행\",\"rows_filtered_count_other\":\"{{shown}} / {{n}}행\",\"running_pods\":\"실행 중인 포드\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"PR이 이미 병합된 워크트리를 안전하게 삭제합니다.\",\"scanning_merged\":\"병합된 항목 검색 중…\",\"select\":\"{{name}} 선택\",\"sort_behind\":\"정렬: 뒤처짐\",\"sort_name\":\"정렬: 이름\",\"sort_recent\":\"정렬: 최근\",\"sort_status\":\"정렬: 상태\",\"sort_worktrees\":\"워크트리 정렬\",\"spin_up_pod\":\"포드 시작\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"`{{cmd}}`을(를) 실행할 때까지 대시보드는 현재 버전을 계속 사용합니다. 재시작 후에는 동일한 URL과 데이터로 ‘{{name}}’을(를) 사용하며, 이 페이지는 자동으로 다시 연결되지 않습니다.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"이 워크트리를 라이브 대상으로 준비합니다(같은 포트, 같은 데이터). Dev Fleet은 이 게이트웨이를 재시작할 수 없으므로, 직접 `{{cmd}}`을(를) 실행할 때 전환이 적용됩니다. 이 페이지는 자동으로 다시 연결되지 않습니다. 워크트리가 프로비저닝되고 빌드되지 않았다면 거부됩니다.\",\"start\":\"시작\",\"starting\":\"시작 중…\",\"starting_pod_for_name_can_take_1_min\":\"{{name}}의 포드를 시작하는 중…(약 1분 걸릴 수 있습니다)\",\"stop_pod\":\"포드 중지\",\"stopped_name\":\"{{name}}을(를) 중지했습니다\",\"stopping_pod\":\"포드 중지 중\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"라이브 대시보드 뒤의 코드를 이 워크트리로 교체합니다(같은 포트, 같은 데이터). 게이트웨이가 재시작되고 이 페이지는 자동으로 다시 연결됩니다. 워크트리가 프로비저닝되고 빌드되지 않았다면 거부됩니다.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"대시보드를 ‘{{name}}’(으)로 되돌립니다(URL과 데이터는 그대로입니다). 대시보드가 잠시 재시작되고 이 페이지는 자동으로 다시 연결됩니다.\",\"sync_progress\":\"동기화 진행 상황\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"동기화 실행이 유실되었습니다(동기화 중 게이트웨이 재시작). 풀+빌드를 다시 실행하세요.\",\"synced\":\"동기화됨\",\"synced_restart_gateway_to_apply_the_new_build\":\"동기화됨 — 새 빌드를 적용하려면 게이트웨이를 재시작하세요.\",\"syncing\":\"동기화 중\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"이 포트의 라이브 게이트웨이는 이 체크아웃에서 실행됩니다\",\"the_primary_checkout_is_on_branch_not_base\":\"기본 체크아웃이 {{base}}이(가) 아니라 {{branch}}에 있습니다. {{base}}(으)로 되돌릴 때까지 풀 + 빌드는 동기화를 거부합니다.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"이 플릿을 탐색하는 기준이 되는 기본 체크아웃\",\"tickets\":\"티켓:\",\"toggle_log\":\"로그 전환\",\"toggle_provision_log\":\"프로비저닝 로그 전환\",\"token_mint_failed\":\"토큰 발급 실패\",\"total_disk_used_by_running_pod_homes\":\"실행 중인 파드 홈이 사용하는 총 디스크\",\"uncommitted_changes\":\"커밋되지 않은 변경\",\"undo_make_live_failed\":\"대시보드를 이전 버전으로 되돌리지 못했습니다\",\"undo_to_name\":\"‘{{name}}’(으)로 돌아가기\",\"up_to_date_with_main\":\"main과 최신 상태\",\"updated\":\"업데이트됨\",\"verifying\":\"검증 중\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"새 게이트웨이 프로세스를 기다리는 중입니다. 게이트웨이가 시작되면 페이지가 자동으로 새로 고쳐집니다.\",\"worktree\":\"워크트리\",\"worktrees\":\"워크트리\",\"worktrees_count\":\"워크트리({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"이전 저장소 이름으로 생성된 워크트리입니다. 기본적으로 숨겨지며, 병합된 항목 정리 대상에는 포함됩니다.\"}}")
	},
	pt: {
		api: { "client": {
			"proxy_challenge_reload": "Recarregue esta aba do navegador: se aparecer uma página de login, a sessão do seu proxy de acesso expirou. Caso contrário, um proxy ou firewall na frente deste painel recusou a solicitação; verifique os logs do proxy ou tente de novo mais tarde.",
			"server_temporarily_unavailable_http_status": "O servidor está temporariamente indisponível (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_many": "{{app}} falhou ao reiniciar {{count}} vezes seguidas e continuará tentando a cada poucos minutos. Para tentar agora, desative {{app}} e ative novamente.",
				"restart_exhausted_message_one": "{{app}} falhou ao reiniciar {{count}} vez seguida e continuará tentando a cada poucos minutos. Para tentar agora, desative {{app}} e ative novamente.",
				"restart_exhausted_message_other": "{{app}} falhou ao reiniciar {{count}} vezes seguidas e continuará tentando a cada poucos minutos. Para tentar agora, desative {{app}} e ative novamente.",
				"restart_exhausted_title": "{{app}} não consegue reiniciar"
			},
			"devFleet": { "manifest": {
				"configuration_1": "Aponte o app para um checkout do Kiro Crew; ações de PR precisam do gh autenticado, enquanto pods precisam de systemd --user no Linux, launchd no macOS ou do Agendador de Tarefas no Windows e devem ser provisionados primeiro.",
				"description": "Um painel de controle para trabalhar no próprio Kiro Crew. Lista cada worktree de feature junto com o estado da pull request, a contagem de commits e o uso de disco, e pode subir qualquer uma delas como um pod: uma instância de preview completa, em uma porta e um diretório de dados próprios, para você navegar por uma alteração inacabada sem incomodar o seu gateway ativo. Também cuida das tarefas em volta disso — fazer pull do main e reconstruir, fazer rebase de uma branch, acompanhar os logs do pod e limpar worktrees cujo trabalho já foi mesclado.",
				"display_name": "Dev Fleet",
				"highlight_1": "Suba qualquer worktree como um pod isolado, com porta e diretório de dados próprios, deixando o seu gateway ativo intacto",
				"highlight_2": "Visão da frota com status de PR por branch, contagem de commits e uso de disco",
				"highlight_3": "Sincronize (pull do main e reconstrução) ou faça rebase de uma branch sem sair do painel",
				"highlight_4": "'Limpar mescladas' se recusa a excluir uma worktree com trabalho não commitado ou não rastreado, em vez de descartá-lo",
				"highlight_5": "Acompanhe os logs do pod e emita tokens de acesso ao pod pela interface",
				"highlight_6": "Feito para quem desenvolve o próprio Kiro Crew — não é necessário no uso diário",
				"highlight_7": "Os pods rodam em Linux (systemd --user), macOS (launchd) e Windows (Agendador de Tarefas) — mas o pod do macOS não tem limite de memória/CPU aplicado; Make Live prepara o ponteiro em todas as plataformas, e o reinício automático exige uma unidade systemd --user ou um LaunchAgent do macOS; a visão da frota, o status de PR, a sincronização, o rebase e a limpeza funcionam em qualquer plataforma",
				"page_label": "Dev Fleet",
				"use_case_1": "Opere worktrees de recursos do Kiro Crew e pods isolados de pré-visualização sem alterar o gateway ativo."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"Ações\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"Aplica o último Pull+Build. O dashboard vai se desconectar por um instante e reconectar sozinho.\",\"backend_unavailable\":\"Backend indisponível\",\"behind\":\"Atrás\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"inicia qualquer worktree como um\\n              gateway isolado e descartável, para você testar uma branch de feature sem tocar na sua instância ativa.\",\"branch\":\"Branch:\",\"build_finished_restarting_gateway\":\"Build concluída — reiniciando o gateway…\",\"build_pending\":\"build pendente\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"build pendente — reinicie o gateway para aplicar (kirocrew restart)\",\"building\":\"Compilando…\",\"built\":\"compilada\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"Compilada e pronta — inicie um pod pelo menu da linha para fazer QA desta branch\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"Compilada — mas neste host os pods não podem rodar; visualize com ./dev-backend.sh\",\"cancel\":\"Cancelar\",\"cancel_staged_cutover\":\"Cancelar a troca preparada\",\"cancel_staged_cutover_2\":\"Cancelar a troca preparada?\",\"cannot_remove_the_main_worktree\":\"Não é possível remover a worktree principal\",\"cannot_resolve_worktree_path_for_name\":\"Não foi possível resolver o caminho da worktree de {{name}}\",\"close\":\"Fechar\",\"closed_has_unmerged_commits\":\"PR fechado — tem commits que não estão em main\",\"closed_pr_not_on_main_hint\":\"PR fechado e não mesclado — seu conteúdo não está em main, então removê-lo o apaga permanentemente. Revise antes de selecionar.\",\"collapse\":\"Recolher\",\"commits\":\"Commits:\",\"commits_behind_main\":\"Commits atrás do main\",\"commits_behind_main_2_many\":\"{{count}} commits atrás do main\",\"commits_behind_main_2_one\":\"{{count}} commit atrás do main\",\"commits_behind_main_2_other\":\"{{count}} commits atrás do main\",\"confirm\":\"Confirmar\",\"conflicts_aborted\":\"Conflitos — abortado\",\"created_recently\":\"criada recentemente\",\"current_step\":\"etapa atual\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"Troca preparada: esta worktree ficará ativa na próxima vez que o gateway iniciar. Execute `{{cmd}}` para concluí-la, ou use o menu desta linha → Cancelar a troca preparada para desfazer. Até lá o gateway continua executando o checkout anterior.\",\"cutover_staged_run_the_restart_command_to_finish\":\"Troca preparada: esta worktree ficará ativa na próxima vez que o gateway iniciar. Execute `{{cmd}}` para concluí-la — até lá o gateway continua executando o checkout anterior.\",\"delete_anyway\":\"Excluir mesmo assim\",\"design_docs\":\"Documentos de design:\",\"dev_fleet\":\"Frota Dev\",\"discard_untracked_files\":\"Também descarta arquivos não rastreados ({{count}}), entre eles: {{files}}\",\"discovery_error\":\"Erro de descoberta\",\"disk\":\"Disco:\",\"disk_usage_unavailable\":\"Uso de disco indisponível\",\"disk_worktrees\":\"Disco (worktrees)\",\"dismiss\":\"Descartar\",\"dismiss_sync_status\":\"Descartar status de sincronização\",\"each_row_below_is_a_git_worktree_discovered_from\":\"Cada linha abaixo é uma worktree git descoberta a partir do checkout principal. Use\",\"empty_worktree_cannot_be_undone\":\"Worktree vazia. Não pode ser desfeito.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"Toda worktree git do checkout principal. O Pull+Build sincroniza o main; pods são gateways isolados iniciados a partir de uma worktree.\",\"expand\":\"Expandir\",\"failed\":\"Falhou\",\"failed_to_load_logs\":\"Falha ao carregar os logs\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"Busca o main mais recente e reaplica os commits. Recusado se houver alterações não commitadas; em caso de conflito, o rebase é abortado.\",\"filter_worktrees\":\"Filtrar worktrees…\",\"filter_worktrees_2\":\"Filtrar worktrees\",\"finished\":\"Concluído\",\"force_remove\":\"Forçar remoção de {{name}}\",\"force_remove_confirm_desc_many\":\"{{count}} de worktrees têm trabalho não mesclado ou não commitado. Removê-las exclui permanentemente todas as alterações locais. Esta ação não pode ser desfeita.\",\"force_remove_confirm_desc_one\":\"{{count}} worktree tem trabalho não mesclado ou não commitado. Removê-la exclui permanentemente todas as alterações locais. Esta ação não pode ser desfeita.\",\"force_remove_confirm_desc_other\":\"{{count}} worktrees têm trabalho não mesclado ou não commitado. Removê-las exclui permanentemente todas as alterações locais. Esta ação não pode ser desfeita.\",\"force_remove_confirm_title\":\"Forçar remoção das worktrees?\",\"force_remove_warning\":\"As worktrees selecionadas têm trabalho não mesclado — a remoção é permanente e não pode ser desfeita.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"O gateway não voltou em 60s — recarregue a página manualmente ou verifique `kirocrew logs`.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"gateway reiniciado durante a sincronização — execução perdida; verifique o estado do git e execute o Pull+Build novamente\",\"git_status_failed\":\"git status falhou\",\"has_unmerged_work_removing_deletes_permanently\":\"Tem trabalho não mesclado — remover EXCLUI permanentemente.\",\"hide_legacy_worktrees\":\"Ocultar {{n}} worktrees legadas\",\"hide_logs\":\"Ocultar logs\",\"issues\":\"Issues:\",\"keep_cutover\":\"Manter a troca\",\"keeps_name_the_live_target_and_discards_the_stag\":\"Mantém “{{name}}” como destino ativo e descarta a troca preparada para “{{staged}}”. Nada é reiniciado — o gateway continua executando o código atual.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"Mantém o checkout ativo como destino ativo e descarta a troca preparada para {{staged}} (nada é reiniciado)\",\"keeps_this_checkout_the_live_target_and_discards\":\"Mantém este checkout como destino ativo e descarta a troca preparada para “{{staged}}” (nada é reiniciado)\",\"kept\":\"Mantidas\",\"kept_discard_untracked_hint\":\"Linhas retidas apenas por arquivos temporários não rastreados: marcar uma descarta os arquivos listados nessa linha.\",\"kept_force_hint\":\"Marque para forçar a remoção — exclui trabalho não mesclado.\",\"last_commit_activity\":\"Última atividade de commit\",\"legacy_worktrees_hidden_show\":\"{{n}} worktrees legadas ocultas · Mostrar\",\"live\":\"ativo\",\"live_checkout_changed_to_name\":\"O painel agora usa “{{name}}”.\",\"live_state_unknown\":\"Estado ativo indisponível\",\"live_state_unknown_help\":\"O gateway não conseguiu informar qual checkout está ativo (o checkout a partir do qual o próprio gateway é executado) ou preparado, por isso nenhuma linha aparece como ativa — o estado é desconhecido, não vazio. Pergunte ao agente antes de ativar um checkout.\",\"live_unverified\":\"ativo?\",\"load_pod_logs\":\"Carregar os logs do pod\",\"loading\":\"Carregando…\",\"log\":\"log ▴\",\"log_2\":\"log ▾\",\"main\":\"· main\",\"make_live\":\"Tornar ativa\",\"make_live_failed\":\"Falha ao tornar ativa\",\"make_name_live\":\"Tornar “{{name}}” ativa?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"Gerencie as worktrees git do seu checkout principal — sincronização, rebase, pods de QA e limpeza em um só lugar.\",\"marked_live_but_this_install_cant_confirm_it\":\"Instalação empacotada: não é possível confirmar que este checkout está em execução.\",\"more_actions\":\"Mais ações\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"move uma branch de feature para o main mais recente, e\",\"needs_provision\":\"Precisa de provisionamento\",\"no_candidates_found\":\"Nenhum candidato encontrado.\",\"no_checkout_found\":\"Nenhum checkout do {{productName}} encontrado\",\"no_checkout_found_action\":\"Adicione dev_fleet.repo_path ao config.json no diretório de dados do {{productName}} (~/.kiro/crew por padrão) e esta página o detecta na próxima atualização. A variável de ambiente abaixo também funciona, mas um gateway em execução não vê uma variável definida depois de iniciar, então esse caminho exige um reinício.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/caminho/para/seu/checkout\",\"no_checkout_found_help\":\"O Dev Fleet gerencia os worktrees git de um checkout do código do {{productName}}. Nenhum foi encontrado no diretório do projeto, no checkout que serve este painel nem nos locais de clonagem habituais.\",\"no_commits_stale\":\"sem commits, desatualizada\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"Ainda sem build de venv/UI — o provisionamento compila esta worktree para que um pod possa rodar\",\"no_worktrees_found\":\"Nenhuma worktree encontrada\",\"not_built\":\"não compilada\",\"nothing_selected\":\"Nada selecionado\",\"nothing_to_prune\":\"Nada para limpar\",\"nothing_under_the_worktrees_root_yet\":\"Ainda não há nada na raiz das worktrees.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"na linha do main para fazer fast-forward a partir do origin e reconstruir\\n              (depois reinicie o gateway para aplicar).\",\"open\":\"Abrir\",\"orphan_pods_label\":\"Homes de pods órfãos: {{value}}\",\"parked_on_branch\":\"Parado em {{branch}}\",\"pending\":\"Pendente\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"As ações Pod e \\\"Tornar ativa\\\" estão ocultas; todo o resto desta página funciona normalmente.\",\"pod_cpu\":\"CPU: {{value}}\",\"pod_cpu_usage\":\"Uso de CPU do pod\",\"pod_home_disk\":\"Disco de homes de pods: {{value}}\",\"pod_home_size\":\"Home do pod: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"Homes de pods deixados no disco sem um pod ativo\",\"pod_memory\":\"Memória: {{value}}\",\"pod_memory_of_ceiling\":\"Memória do pod usada em relação ao seu limite de cgroup\",\"pod_running_on\":\"Pod: em execução em :\",\"pod_sick\":\"pod com problema\",\"pod_start_failed\":\"Falha ao iniciar o pod\",\"pod_task_chip_many\":\"{{n}} tarefas\",\"pod_task_chip_one\":\"{{n}} tarefa\",\"pod_task_chip_other\":\"{{n}} tarefas\",\"pod_task_count\":\"Contagem de tarefas do pod (processos/threads)\",\"pod_tasks\":\"Tarefas: {{value}}\",\"pod_up\":\"pod ativo\",\"pod_up_name\":\"Pod ativo: {{name}}\",\"pods_are_unavailable_on_this_host\":\"Os pods não estão disponíveis neste host.\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR fechado — o branch tem commits mais recentes\",\"pr_closed_but_verification_unavailable_retry\":\"PR fechado, mas a verificação está indisponível — tente novamente\",\"pr_closed_not_on_main\":\"PR fechado — não está em main\",\"pr_closed_uncommitted_changes\":\"PR fechado — alterações não confirmadas\",\"pr_merged\":\"PR mesclado\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR mesclado, mas novos commits foram enviados após o merge\",\"pr_merged_but_verification_unavailable_retry\":\"PR mesclado, mas a verificação está indisponível — tente novamente\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR mesclado — seguro remover. Executa `git worktree remove`. Não pode ser desfeito.\",\"pr_merged_uncommitted_changes\":\"PR mesclado, alterações não commitadas\",\"pr_open_or_unmerged_commits\":\"PR aberto ou commits não mesclados\",\"pr_state_closed\":\"fechada\",\"pr_state_merged\":\"mesclada\",\"pr_state_open\":\"aberta\",\"protected_worktree\":\"Protegida — principal ou atualmente ativa\",\"provision\":\"Provisionar\",\"provision_failed\":\"Falha no provisionamento\",\"provision_failed_exit_code\":\"Falha no provisionamento (saída {{code}})\",\"provision_failed_status\":\"Falha no provisionamento ({{status}})\",\"provision_failed_to_start\":\"Falha ao iniciar o provisionamento\",\"provision_polling_timed_out_check_pod_logs\":\"Tempo esgotado ao consultar o provisionamento — verifique os logs do pod\",\"provision_timed_out\":\"Tempo do provisionamento esgotado\",\"provisioned\":\"Provisionada\",\"provisioning\":\"Provisionando\",\"prune\":\"Limpar\",\"prune_complete\":\"Limpeza concluída\",\"prune_failed_count_many\":\"Limpeza: {{count}} com falha\",\"prune_failed_count_one\":\"Limpeza: {{count}} com falha\",\"prune_failed_count_other\":\"Limpeza: {{count}} com falha\",\"prune_failed_to_start\":\"Falha ao iniciar a limpeza\",\"prune_merged\":\"Limpar mescladas\",\"prune_preview_failed\":\"Falha na prévia da limpeza\",\"prune_worktrees\":\"Limpar worktrees\",\"pruned_worktrees_many\":\"{{count}} worktrees limpos\",\"pruned_worktrees_one\":\"{{count}} worktree limpo\",\"pruned_worktrees_other\":\"{{count}} worktrees limpos\",\"pruned_worktrees_some_failed_many\":\"{{count}} worktrees limpos ({{failed}} com falha)\",\"pruned_worktrees_some_failed_one\":\"{{count}} worktree limpo ({{failed}} com falha)\",\"pruned_worktrees_some_failed_other\":\"{{count}} worktrees limpos ({{failed}} com falha)\",\"pruning_worktrees\":\"Limpando worktrees\",\"pull_build\":\"Pull + Build\",\"pull_build_2\":\"Pull+Build\",\"pull_build_failed\":\"Pull+Build falhou\",\"pull_build_failed_exit_code_detail\":\"Falha no Pull+Build (saída {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"Falha ao iniciar o Pull+Build\",\"pull_build_main\":\"Pull + Build do main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"Faz pull da branch base e recompila (~6 min). NÃO reinicia.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"Puxa a branch base, recompila (~6 min) e reinicia o gateway automaticamente. Mantenha esta página aberta até o build terminar.\",\"purpose\":\"Objetivo:\",\"qa_pod_is_running_but_failing_its_health_check\":\"O pod de QA está rodando, mas falhando na verificação de saúde\",\"qa_pod_is_running_click_open_to_use_it\":\"O pod de QA está rodando — clique em Abrir para usá-lo\",\"qa_video\":\"QA + vídeo\",\"rebase\":\"Rebase\",\"rebase_conflicts\":\"Conflitos de rebase\",\"rebase_failed\":\"Falha no rebase\",\"rebase_name\":\"Fazer rebase de “{{name}}”?\",\"rebase_onto_main\":\"Rebase sobre a branch base\",\"rebased_head\":\"Rebase concluído (HEAD {{head}})\",\"refresh\":\"Atualizar\",\"refresh_fleet\":\"Atualizar frota\",\"remove\":\"Remover\",\"remove_closed_pr\":\"Remover — PR fechado (não está em main)\",\"remove_name\":\"Remover “{{name}}”?\",\"remove_selected\":\"Remover selecionadas\",\"removed\":\"Removido\",\"removed_name\":\"{{name}} removida\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"Remove as worktrees e para os pods. Não pode ser desfeito.\",\"removing\":\"Removendo\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"Aponta o gateway ativo para esta worktree (reinicia o gateway)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"Aponta o gateway ativo de volta para o main (reinicia o gateway)\",\"restart\":\"Reiniciar\",\"restart_failed\":\"Falha ao reiniciar\",\"restart_gateway\":\"Reiniciar gateway\",\"restart_gateway_2\":\"Reiniciar o gateway?\",\"restart_gateway_to_apply_the_new_build\":\"reinicie o gateway para aplicar o novo build\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"Reiniciar o pod\",\"restarted_name\":\"{{name}} reiniciado\",\"restarting_completes_the_pending_cutover_boots\":\"Reiniciar conclui a troca pendente: o gateway voltará com \\\"{{staged}}\\\", não com o checkout atual. O painel desconectará brevemente e reconectará automaticamente. Para desfazer, use Cancelar a troca preparada.\",\"restarting_reconnecting\":\"Reiniciando — reconectando…\",\"rows_count_many\":\"{{n}} linhas\",\"rows_count_one\":\"{{n}} linha\",\"rows_count_other\":\"{{n}} linhas\",\"rows_filtered_count_many\":\"{{shown}} / {{n}} linhas\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} linha\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} linhas\",\"running_pods\":\"Pods em execução\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"remove com segurança as worktrees cujo PR já foi mesclado.\",\"scanning_merged\":\"Procurando mescladas…\",\"select\":\"Selecionar {{name}}\",\"sort_behind\":\"Ordenar: atrás\",\"sort_name\":\"Ordenar: nome\",\"sort_recent\":\"Ordenar: recentes\",\"sort_status\":\"Ordenar: status\",\"sort_worktrees\":\"Ordenar worktrees\",\"spin_up_pod\":\"Iniciar pod\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"O painel continuará usando a versão atual até você executar `{{cmd}}`. Após a reinicialização, ele usará “{{name}}” com a mesma URL e os mesmos dados; esta página não se reconectará automaticamente.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Prepara esta worktree como destino ativo (mesma porta, mesmos dados). O Dev Fleet não pode reiniciar este gateway, então a troca só entra em vigor quando você executar `{{cmd}}` manualmente — esta página NÃO se reconectará sozinha. Recusado a menos que a worktree esteja provisionada e compilada.\",\"start\":\"Iniciar\",\"starting\":\"iniciando…\",\"starting_pod_for_name_can_take_1_min\":\"Iniciando o pod para {{name}}… (pode levar ~1 min)\",\"stop_pod\":\"Parar o pod\",\"stopped_name\":\"{{name}} interrompido\",\"stopping_pod\":\"Parando o pod\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"Troca o código por trás do dashboard ativo para esta worktree (mesma porta, mesmos dados). O gateway reinicia e esta página reconecta automaticamente. Recusado a menos que a worktree esteja provisionada e compilada.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"Volta o painel para “{{name}}” (mesma URL e os mesmos dados). O painel reinicia brevemente e esta página se reconecta automaticamente.\",\"sync_progress\":\"Progresso da sincronização\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"Execução de sincronização perdida (o gateway reiniciou durante a sincronização). Execute o Pull+Build novamente.\",\"synced\":\"Sincronizada\",\"synced_restart_gateway_to_apply_the_new_build\":\"Sincronizado — reinicie o gateway para aplicar a nova build.\",\"syncing\":\"Sincronizando\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"O gateway ativo nesta porta é executado a partir deste checkout\",\"the_primary_checkout_is_on_branch_not_base\":\"O checkout principal está em {{branch}}, não em {{base}}. Pull + Build se recusará a sincronizar até que ele volte para {{base}}.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"O checkout principal a partir do qual esta frota é descoberta\",\"tickets\":\"Tickets:\",\"toggle_log\":\"Alternar log\",\"toggle_provision_log\":\"Alternar log de provisionamento\",\"token_mint_failed\":\"Falha ao gerar o token\",\"total_disk_used_by_running_pod_homes\":\"Disco total usado pelos homes de pods em execução\",\"uncommitted_changes\":\"alterações não commitadas\",\"undo_make_live_failed\":\"Não foi possível voltar o painel\",\"undo_to_name\":\"Voltar para {{name}}\",\"up_to_date_with_main\":\"atualizada com o main\",\"updated\":\"Atualizada\",\"verifying\":\"Verificando\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"Aguardando o novo processo do gateway. A página recarrega automaticamente quando ele estiver ativo.\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktrees\",\"worktrees_count\":\"Worktrees ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"Worktrees criadas com um nome de repositório anterior. Ocultas por padrão; ainda incluídas em Limpar mescladas.\"}}")
	},
	ru: {
		api: { "client": {
			"proxy_challenge_reload": "Обнови эту вкладку браузера: если появится страница входа, сессия твоего прокси доступа истекла. Если нет — прокси или файрвол перед этой панелью отклонил запрос; посмотри журналы прокси или повтори позже.",
			"server_temporarily_unavailable_http_status": "Сервер временно недоступен (HTTP {{status}})"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_few": "{{app}} не смогло перезапуститься {{count}} раза подряд и будет продолжать попытки каждые несколько минут. Чтобы повторить сейчас, отключи {{app}} и снова включи.",
				"restart_exhausted_message_many": "{{app}} не смогло перезапуститься {{count}} раз подряд и будет продолжать попытки каждые несколько минут. Чтобы повторить сейчас, отключи {{app}} и снова включи.",
				"restart_exhausted_message_one": "{{app}} не смогло перезапуститься {{count}} раз подряд и будет продолжать попытки каждые несколько минут. Чтобы повторить сейчас, отключи {{app}} и снова включи.",
				"restart_exhausted_message_other": "{{app}} не смогло перезапуститься {{count}} раза подряд и будет продолжать попытки каждые несколько минут. Чтобы повторить сейчас, отключи {{app}} и снова включи.",
				"restart_exhausted_title": "{{app}} не удаётся перезапустить"
			},
			"devFleet": { "manifest": {
				"configuration_1": "Укажи checkout Kiro Crew; для операций с PR нужен авторизованный gh, а pod требуют предварительной подготовки и systemd --user в Linux, launchd в macOS либо Планировщика заданий в Windows.",
				"description": "Панель для работы над самим Kiro Crew. Показывает каждый worktree с функцией, а рядом — состояние его пул-реквеста, число коммитов и занятое место на диске, и любой из них может поднять как pod: полноценный экземпляр для предпросмотра на своём порте и со своим каталогом данных, чтобы пощёлкать незаконченное изменение, не трогая рабочий шлюз. Заодно берёт на себя рутину вокруг этого — подтянуть main и пересобрать, перебазировать ветку, показать логи pod и вычистить worktree, работа из которых уже влита.",
				"display_name": "Dev Fleet",
				"highlight_1": "Поднимай любой worktree как изолированный pod на своём порте и со своим каталогом данных, не затрагивая рабочий шлюз",
				"highlight_2": "Обзор флота: статус PR по каждой ветке, число коммитов и занятое место на диске",
				"highlight_3": "Синхронизация (подтянуть main и пересобрать) или перебазирование ветки, не покидая панель",
				"highlight_4": "«Prune merged» откажется удалить worktree с незакоммиченными или неотслеживаемыми изменениями, а не выбросит их",
				"highlight_5": "Поток логов pod и выпуск ключей доступа к pod прямо в интерфейсе",
				"highlight_6": "Сделано для тех, кто разрабатывает сам Kiro Crew — для повседневной работы не нужно",
				"highlight_7": "Pod работает на Linux (systemd --user), macOS (launchd) и Windows (Планировщик заданий) — но у pod на macOS нет принудительного лимита памяти/CPU; Make Live готовит указатель на любой платформе, а для автоматического перезапуска нужен юнит systemd --user или LaunchAgent macOS; обзор флота, статус PR, синхронизация, перебазирование и очистка работают на любой платформе",
				"page_label": "Dev Fleet",
				"use_case_1": "Управляйте feature-worktree Kiro Crew и изолированными preview pod, не затрагивая работающий шлюз."
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"Действия\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"Применяет последний Pull+Build. Панель на короткое время отключится и переподключится сама.\",\"backend_unavailable\":\"Бэкенд недоступен\",\"behind\":\"Отставание\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"запускает любой worktree как\\n              изолированный одноразовый шлюз, чтобы протестировать ветку функции, не затрагивая рабочий экземпляр.\",\"branch\":\"Ветка:\",\"build_finished_restarting_gateway\":\"Сборка завершена — перезапуск шлюза…\",\"build_pending\":\"сборка ожидается\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"сборка ожидается — перезапустите шлюз, чтобы применить (kirocrew restart)\",\"building\":\"Сборка…\",\"built\":\"собрано\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"Собрано и готово — запусти pod из меню строки, чтобы проверить эту ветку\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"Собрано — но на этом хосте pod’ы не запускаются; используй ./dev-backend.sh для предпросмотра\",\"cancel\":\"Отмена\",\"cancel_staged_cutover\":\"Отменить подготовленное переключение\",\"cancel_staged_cutover_2\":\"Отменить подготовленное переключение?\",\"cannot_remove_the_main_worktree\":\"Нельзя удалить основной worktree\",\"cannot_resolve_worktree_path_for_name\":\"Не удалось определить путь worktree для {{name}}\",\"close\":\"Закрыть\",\"closed_has_unmerged_commits\":\"Закрытый PR — есть коммиты, отсутствующие в main\",\"closed_pr_not_on_main_hint\":\"Закрытый несмерженный PR — его содержимое отсутствует в main, поэтому удаление приведёт к безвозвратной потере. Проверьте перед выбором.\",\"collapse\":\"Свернуть\",\"commits\":\"Коммиты:\",\"commits_behind_main\":\"Отставание от main (коммиты)\",\"commits_behind_main_2_few\":\"отстаёт от main на {{count}} коммита\",\"commits_behind_main_2_many\":\"отстаёт от main на {{count}} коммитов\",\"commits_behind_main_2_one\":\"отстаёт от main на {{count}} коммит\",\"commits_behind_main_2_other\":\"отстаёт от main на {{count}} коммита\",\"confirm\":\"Подтвердить\",\"conflicts_aborted\":\"Конфликты — прервано\",\"created_recently\":\"создан недавно\",\"current_step\":\"текущий шаг\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"Переключение подготовлено: это рабочее дерево станет активным при следующем запуске шлюза. Выполните `{{cmd}}`, чтобы завершить его, или используйте меню этой строки → Отменить подготовленное переключение, чтобы отказаться. До этого шлюз продолжает работать на прежнем чекауте.\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"Всё равно удалить\",\"design_docs\":\"Проектные документы:\",\"dev_fleet\":\"Флот разработки\",\"discard_untracked_files\":\"Также отбрасывает неотслеживаемые файлы ({{count}}), в том числе: {{files}}\",\"discovery_error\":\"Ошибка обнаружения\",\"disk\":\"Диск:\",\"disk_usage_unavailable\":\"Данные об использовании диска недоступны\",\"disk_worktrees\":\"Диск (worktree)\",\"dismiss\":\"Скрыть\",\"dismiss_sync_status\":\"Скрыть статус синхронизации\",\"each_row_below_is_a_git_worktree_discovered_from\":\"Каждая строка ниже — это git worktree, найденный в основной рабочей копии. Используйте\",\"empty_worktree_cannot_be_undone\":\"Пустой worktree. Отменить нельзя.\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"Все git worktree основной рабочей копии. Pull+Build синхронизирует main; pod — изолированные шлюзы, поднятые из worktree.\",\"expand\":\"Развернуть\",\"failed\":\"Ошибка\",\"failed_to_load_logs\":\"Не удалось загрузить логи\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"Забирает свежий main и переигрывает коммиты. Отклоняется при незакоммиченных изменениях; при конфликте rebase прерывается.\",\"filter_worktrees\":\"Фильтр worktree…\",\"filter_worktrees_2\":\"Фильтр worktree\",\"finished\":\"Завершено\",\"force_remove\":\"Принудительно удалить {{name}}\",\"force_remove_confirm_desc_few\":\"{{count}} worktree содержат неслитые или незакоммиченные изменения. Удаление навсегда удалит все локальные изменения. Отменить нельзя.\",\"force_remove_confirm_desc_many\":\"{{count}} worktree содержат неслитые или незакоммиченные изменения. Удаление навсегда удалит все локальные изменения. Отменить нельзя.\",\"force_remove_confirm_desc_one\":\"{{count}} worktree содержит неслитые или незакоммиченные изменения. Удаление навсегда удалит все локальные изменения. Отменить нельзя.\",\"force_remove_confirm_desc_other\":\"{{count}} worktree содержат неслитые или незакоммиченные изменения. Удаление навсегда удалит все локальные изменения. Отменить нельзя.\",\"force_remove_confirm_title\":\"Принудительно удалить worktree?\",\"force_remove_warning\":\"Выбранные worktree содержат неслитые изменения — удаление необратимо и отменить его нельзя.\",\"gateway_did_not_come_back_within_60s_reload_the\":\"Шлюз не вернулся за 60 с — перезагрузи страницу вручную или проверь `kirocrew logs`.\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"шлюз перезапустился во время синхронизации — запуск потерян; проверь состояние git и запусти Pull+Build заново\",\"git_status_failed\":\"git status завершился с ошибкой\",\"has_unmerged_work_removing_deletes_permanently\":\"Есть невлитая работа — удаление УНИЧТОЖИТ её безвозвратно.\",\"hide_legacy_worktrees\":\"Скрыть устаревшие worktree: {{n}}\",\"hide_logs\":\"Скрыть логи\",\"issues\":\"Задачи:\",\"keep_cutover\":\"Оставить переключение\",\"keeps_name_the_live_target_and_discards_the_stag\":\"«{{name}}» остаётся активной целью, а подготовленное переключение на «{{staged}}» отменяется. Ничего не перезапускается — шлюз продолжает выполнять текущий код.\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"Активный чекаут остаётся активной целью, а подготовленное переключение на {{staged}} отменяется (ничего не перезапускается)\",\"keeps_this_checkout_the_live_target_and_discards\":\"Этот чекаут остаётся активной целью, а подготовленное переключение на «{{staged}}» отменяется (ничего не перезапускается)\",\"kept\":\"Сохранено\",\"kept_discard_untracked_hint\":\"Строки, задержанные только неотслеживаемым временным мусором: отметка одной из них отбрасывает файлы, перечисленные в этой строке.\",\"kept_force_hint\":\"Отметьте для принудительного удаления — удаляет неслитую работу.\",\"last_commit_activity\":\"Последняя активность коммитов\",\"legacy_worktrees_hidden_show\":\"Скрыто устаревших worktree: {{n}} · Показать\",\"live\":\"активный\",\"live_checkout_changed_to_name\":\"Панель теперь использует «{{name}}».\",\"live_state_unknown\":\"Состояние live недоступно\",\"live_state_unknown_help\":\"Шлюз не смог сообщить, какой checkout является live (тот checkout, из которого запущен сам шлюз) или подготовлен, поэтому ни одна строка не отмечена как live — состояние неизвестно, а не пусто. Спроси агента, прежде чем делать checkout live.\",\"live_unverified\":\"активный?\",\"load_pod_logs\":\"Загрузить логи pod\",\"loading\":\"Загрузка…\",\"log\":\"лог ▴\",\"log_2\":\"лог ▾\",\"main\":\"· main\",\"make_live\":\"Сделать активным\",\"make_live_failed\":\"Не удалось сделать активным\",\"make_name_live\":\"Сделать «{{name}}» активным?\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"Управляйте git worktree основной рабочей копии — синхронизация, перебазирование, QA-поды и очистка в одном месте.\",\"marked_live_but_this_install_cant_confirm_it\":\"Пакетная установка: нельзя подтвердить, что запущена эта рабочая копия.\",\"more_actions\":\"Другие действия\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"переносит ветку функции на актуальный main, а\",\"needs_provision\":\"Требуется подготовка\",\"no_candidates_found\":\"Кандидаты не найдены.\",\"no_checkout_found\":\"Локальная копия {{productName}} не найдена\",\"no_checkout_found_action\":\"Добавь dev_fleet.repo_path в config.json в каталоге данных {{productName}} (по умолчанию ~/.kiro/crew), и эта страница подхватит путь при следующем обновлении. Переменная окружения ниже тоже работает, но уже запущенный шлюз не видит переменную, заданную после старта, поэтому для неё нужен перезапуск.\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/путь/к/вашей/копии\",\"no_checkout_found_help\":\"Dev Fleet управляет git-worktree локальной копии исходного кода {{productName}}. Она не найдена ни в каталоге проекта, ни в копии, обслуживающей эту панель, ни в обычных местах клонирования.\",\"no_commits_stale\":\"нет коммитов, устарел\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"Сборки venv/UI ещё нет — «Подготовить» соберёт этот worktree, чтобы можно было запустить pod\",\"no_worktrees_found\":\"Не найдено ни одного worktree\",\"not_built\":\"не собран\",\"nothing_selected\":\"Ничего не выбрано\",\"nothing_to_prune\":\"Нечего очищать\",\"nothing_under_the_worktrees_root_yet\":\"В корневой папке worktree пока ничего нет.\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"в строке main, чтобы подтянуть её из origin (fast-forward) и пересобрать\\n              (затем перезапустите шлюз, чтобы применить).\",\"open\":\"Открыть\",\"orphan_pods_label\":\"Осиротевшие домашние каталоги подов: {{value}}\",\"parked_on_branch\":\"Осталась на {{branch}}\",\"pending\":\"В ожидании\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"Действия Pod и «Сделать активным» скрыты; всё остальное на этой странице работает как обычно.\",\"pod_cpu\":\"ЦП: {{value}}\",\"pod_cpu_usage\":\"Использование ЦП пода\",\"pod_home_disk\":\"Диск домашних каталогов подов: {{value}}\",\"pod_home_size\":\"Домашний каталог пода: {{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"Домашние каталоги подов на диске без активного пода\",\"pod_memory\":\"Память: {{value}}\",\"pod_memory_of_ceiling\":\"Используемая память пода относительно лимита cgroup\",\"pod_running_on\":\"Pod: работает на :\",\"pod_sick\":\"pod нездоров\",\"pod_start_failed\":\"Не удалось запустить pod\",\"pod_task_chip_few\":\"{{n}} задачи\",\"pod_task_chip_many\":\"{{n}} задач\",\"pod_task_chip_one\":\"{{n}} задача\",\"pod_task_chip_other\":\"{{n}} задачи\",\"pod_task_count\":\"Число задач пода (процессы/потоки)\",\"pod_tasks\":\"Задачи: {{value}}\",\"pod_up\":\"pod запущен\",\"pod_up_name\":\"pod запущен: {{name}}\",\"pods_are_unavailable_on_this_host\":\"Pod’ы недоступны на этом хосте.\",\"pr\":\"PR:\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR закрыт — в ветке есть более новые коммиты\",\"pr_closed_but_verification_unavailable_retry\":\"PR закрыт, но проверка недоступна — повтори\",\"pr_closed_not_on_main\":\"PR закрыт — отсутствует в main\",\"pr_closed_uncommitted_changes\":\"PR закрыт — есть незакоммиченные изменения\",\"pr_merged\":\"PR влит\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR влит, но после слияния запушены новые коммиты\",\"pr_merged_but_verification_unavailable_retry\":\"PR влит, но проверка недоступна — повтори\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR влит — можно удалять. Выполняет `git worktree remove`. Отменить нельзя.\",\"pr_merged_uncommitted_changes\":\"PR влит, есть незакоммиченные изменения\",\"pr_open_or_unmerged_commits\":\"PR открыт или есть невлитые коммиты\",\"pr_state_closed\":\"закрыт\",\"pr_state_merged\":\"слит\",\"pr_state_open\":\"открыт\",\"protected_worktree\":\"Защищено — основной или текущий активный\",\"provision\":\"Подготовить\",\"provision_failed\":\"Не удалось подготовить\",\"provision_failed_exit_code\":\"Не удалось подготовить (код выхода {{code}})\",\"provision_failed_status\":\"Не удалось подготовить ({{status}})\",\"provision_failed_to_start\":\"Не удалось запустить подготовку\",\"provision_polling_timed_out_check_pod_logs\":\"Опрос подготовки истёк по времени — проверь логи pod\",\"provision_timed_out\":\"Подготовка истекла по времени\",\"provisioned\":\"Подготовлено\",\"provisioning\":\"Подготовка\",\"prune\":\"Очистить\",\"prune_complete\":\"Очистка завершена\",\"prune_failed_count_few\":\"Не удалось очистить {{count}} worktree\",\"prune_failed_count_many\":\"Не удалось очистить {{count}} worktree\",\"prune_failed_count_one\":\"Не удалось очистить {{count}} worktree\",\"prune_failed_count_other\":\"Не удалось очистить {{count}} worktree\",\"prune_failed_to_start\":\"Не удалось запустить очистку\",\"prune_merged\":\"Очистить влитые\",\"prune_preview_failed\":\"Не удалось показать предпросмотр очистки\",\"prune_worktrees\":\"Очистить worktree\",\"pruned_worktrees_few\":\"Очищено {{count}} worktree\",\"pruned_worktrees_many\":\"Очищено {{count}} worktree\",\"pruned_worktrees_one\":\"Очищен {{count}} worktree\",\"pruned_worktrees_other\":\"Очищено {{count}} worktree\",\"pruned_worktrees_some_failed_few\":\"Очищено {{count}} worktree (не удалось: {{failed}})\",\"pruned_worktrees_some_failed_many\":\"Очищено {{count}} worktree (не удалось: {{failed}})\",\"pruned_worktrees_some_failed_one\":\"Очищен {{count}} worktree (не удалось: {{failed}})\",\"pruned_worktrees_some_failed_other\":\"Очищено {{count}} worktree (не удалось: {{failed}})\",\"pruning_worktrees\":\"Очистка worktree\",\"pull_build\":\"Обновить + Собрать\",\"pull_build_2\":\"Pull+Build\",\"pull_build_failed\":\"Сбой Pull + Build\",\"pull_build_failed_exit_code_detail\":\"Pull+Build не удался (код выхода {{code}}): {{detail}}\",\"pull_build_failed_to_start\":\"Не удалось запустить Pull+Build\",\"pull_build_main\":\"Pull + Build для main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"Забирает базовую ветку и пересобирает (~6 мин). НЕ перезапускает.\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"Загружает базовую ветку, пересобирает (~6 мин) и автоматически перезапускает шлюз. Не закрывай эту страницу до завершения сборки.\",\"purpose\":\"Назначение:\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA-pod запущен, но не проходит проверку работоспособности\",\"qa_pod_is_running_click_open_to_use_it\":\"QA-pod запущен — нажми «Открыть», чтобы работать с ним\",\"qa_video\":\"QA + видео\",\"rebase\":\"Перебазировать\",\"rebase_conflicts\":\"Конфликты при rebase\",\"rebase_failed\":\"Rebase не удался\",\"rebase_name\":\"Перебазировать «{{name}}»?\",\"rebase_onto_main\":\"Перебазировать на базовую ветку\",\"rebased_head\":\"Перебазировано (HEAD {{head}})\",\"refresh\":\"Обновить\",\"refresh_fleet\":\"Обновить список\",\"remove\":\"Удалить\",\"remove_closed_pr\":\"Удалить — закрытый PR (отсутствует в main)\",\"remove_name\":\"Удалить «{{name}}»?\",\"remove_selected\":\"Удалить выбранные\",\"removed\":\"Удалён\",\"removed_name\":\"Удалено: {{name}}\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"Удаляет worktree и останавливает pod. Отменить нельзя.\",\"removing\":\"Удаление\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"Переключить активный шлюз на этот worktree (шлюз перезапустится)\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"Вернуть активный шлюз на main (шлюз будет перезапущен)\",\"restart\":\"Перезапустить\",\"restart_failed\":\"Не удалось перезапустить\",\"restart_gateway\":\"Перезапустить шлюз\",\"restart_gateway_2\":\"Перезапустить шлюз?\",\"restart_gateway_to_apply_the_new_build\":\"перезапустите шлюз, чтобы применить новую сборку\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"Перезапустить pod\",\"restarted_name\":\"Перезапущено: {{name}}\",\"restarting_completes_the_pending_cutover_boots\":\"Перезапуск завершит ожидающее переключение: шлюз запустится на «{{staged}}», а не на текущем чекауте. Панель ненадолго отключится и автоматически переподключится. Чтобы отказаться, используйте «Отменить подготовленное переключение».\",\"restarting_reconnecting\":\"Перезапуск — переподключение…\",\"rows_count_few\":\"{{n}} строки\",\"rows_count_many\":\"{{n}} строк\",\"rows_count_one\":\"{{n}} строка\",\"rows_count_other\":\"{{n}} строки\",\"rows_filtered_count_few\":\"{{shown}} / {{n}} строки\",\"rows_filtered_count_many\":\"{{shown}} / {{n}} строк\",\"rows_filtered_count_one\":\"{{shown}} / {{n}} строка\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} строки\",\"running_pods\":\"Запущенные pod\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"безопасно удаляет worktree, чей PR уже влит.\",\"scanning_merged\":\"Поиск влитых…\",\"select\":\"Выбрать {{name}}\",\"sort_behind\":\"Сортировка: отставание\",\"sort_name\":\"Сортировка: имя\",\"sort_recent\":\"Сортировка: недавние\",\"sort_status\":\"Сортировка: статус\",\"sort_worktrees\":\"Сортировка worktree\",\"spin_up_pod\":\"Запустить pod\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"Панель продолжит использовать текущую версию, пока вы не выполните `{{cmd}}`. После перезапуска она будет использовать «{{name}}» с тем же URL и теми же данными; эта страница не переподключится автоматически.\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"Запустить\",\"starting\":\"запуск…\",\"starting_pod_for_name_can_take_1_min\":\"Запуск pod для {{name}}... (может занять ~1 мин)\",\"stop_pod\":\"Остановить pod\",\"stopped_name\":\"Остановлено: {{name}}\",\"stopping_pod\":\"Остановка pod\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"Подменяет код за активной панелью на этот worktree (тот же порт, те же данные). Шлюз перезапустится, и страница переподключится сама. Отклоняется, если worktree не подготовлен и не собран.\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"Возвращает панель к «{{name}}» (тот же URL и те же данные). Панель ненадолго перезапустится, и эта страница переподключится автоматически.\",\"sync_progress\":\"Ход синхронизации\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"Запуск синхронизации потерян (шлюз перезапустился во время синхронизации). Запусти Pull+Build заново.\",\"synced\":\"Синхронизировано\",\"synced_restart_gateway_to_apply_the_new_build\":\"Синхронизировано — перезапусти шлюз, чтобы применить новую сборку.\",\"syncing\":\"Синхронизация\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"Активный шлюз на этом порту запущен из этой рабочей копии\",\"the_primary_checkout_is_on_branch_not_base\":\"Основная рабочая копия находится на ветке {{branch}}, а не {{base}}. Pull + Build откажется синхронизировать, пока она не будет переключена обратно на {{base}}.\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"Основная рабочая копия, из которой обнаруживается этот флот\",\"tickets\":\"Тикеты:\",\"toggle_log\":\"Показать/скрыть журнал\",\"toggle_provision_log\":\"Показать/скрыть журнал подготовки\",\"token_mint_failed\":\"Не удалось выпустить токен\",\"total_disk_used_by_running_pod_homes\":\"Всего диска, занятого домашними каталогами работающих подов\",\"uncommitted_changes\":\"незакоммиченные изменения\",\"undo_make_live_failed\":\"Не удалось вернуть предыдущую версию панели\",\"undo_to_name\":\"Вернуться к {{name}}\",\"up_to_date_with_main\":\"синхронизирован с main\",\"updated\":\"Обновлено\",\"verifying\":\"Проверка\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"Ожидание нового процесса шлюза. Страница перезагрузится автоматически, как только он запустится.\",\"worktree\":\"Worktree\",\"worktrees\":\"Worktree\",\"worktrees_count\":\"Worktree ({{count}})\",\"worktrees_created_under_a_previous_repository_na\":\"Worktree, созданные под предыдущим именем репозитория. По умолчанию скрыты; по-прежнему учитываются кнопкой «Очистить объединённые».\"}}")
	},
	"zh-CN": {
		api: { "client": {
			"proxy_challenge_reload": "请重新加载此浏览器标签页：如果出现登录页面，说明访问代理的会话已过期。否则，则是此仪表板前方的代理或防火墙拒绝了请求；请查看代理日志，或稍后重试。",
			"server_temporarily_unavailable_http_status": "服务器暂时不可用（HTTP {{status}}）"
		} },
		apps: {
			"backend": {
				"restart_exhausted_message_other": "{{app}} 已连续 {{count}} 次重启失败，并将每隔几分钟继续重试。要立即重试，请先禁用 {{app}} 再重新启用。",
				"restart_exhausted_title": "{{app}} 始终无法重启"
			},
			"devFleet": { "manifest": {
				"configuration_1": "将应用指向 Kiro Crew 检出目录；PR 操作需认证 gh，Pod 需 Linux systemd --user、macOS launchd 或 Windows 任务计划程序，并先完成配置。",
				"description": "开发 Kiro Crew 本身用的控制面板。列出每个功能工作树及其拉取请求状态、提交数和磁盘用量，还能把其中任意一个拉起为 Pod。Pod 是一套完整预览实例，占用独立端口和独立数据目录，于是你可以点开未做完的改动，而不影响正在运行的网关。周边杂活它也一并处理 — 拉取 main 并重新构建、给分支变基、流式查看 Pod 日志，以及清理工作已合并的工作树。",
				"display_name": "Dev Fleet",
				"highlight_1": "把任意工作树拉起为独立 Pod，占用自己的端口和数据目录，正在运行的网关毫不受影响",
				"highlight_2": "机群视图显示每个分支的 PR 状态、提交数和磁盘用量",
				"highlight_3": "在仪表板里同步（拉取 main 并重新构建）或给分支变基",
				"highlight_4": "“Prune merged”不会删除仍有未提交或未跟踪改动的工作树，而是拒绝操作",
				"highlight_5": "在界面上流式查看 Pod 日志，并签发 Pod 访问令牌",
				"highlight_6": "给开发 Kiro Crew 本身的人用 — 日常使用并不需要它",
				"highlight_7": "Pod 可以跑在 Linux（systemd --user）、macOS（launchd）和 Windows（任务计划程序）上 — 但 macOS 上的 Pod 没有强制的内存/CPU 上限；Make Live 在所有平台都会暂存指针，自动重启需要 systemd --user 单元或 macOS LaunchAgent；机群视图、PR 状态、同步、变基和清理在任何平台都可用",
				"page_label": "Dev Fleet",
				"use_case_1": "在不影响线上网关的情况下，管理 Kiro Crew 功能工作树和隔离的预览 Pod。"
			} }
		},
		pages: /* @__PURE__ */ JSON.parse("{\"devFleetPage\":{\"actions\":\"操作\",\"applies_the_last_pull_build_the_dashboard_will_b\":\"应用最近一次“拉取+构建”的结果。仪表板会短暂断开并自动重连。\",\"backend_unavailable\":\"后端不可用\",\"behind\":\"落后\",\"boots_any_worktree_as_an_isolated_throwaway_gate\":\"将任意工作树启动为\\n              独立的一次性网关，让你无需触碰正在运行的实例即可测试功能分支。\",\"branch\":\"分支：\",\"build_finished_restarting_gateway\":\"构建完成 — 正在重启网关…\",\"build_pending\":\"待构建\",\"build_pending_restart_gateway_to_apply_kirocrew\":\"待构建 — 重启网关以生效 (kirocrew restart)\",\"building\":\"正在构建…\",\"built\":\"已构建\",\"built_and_ready_spin_up_a_pod_from_the_row_menu\":\"已构建就绪 — 从行菜单启动 pod 即可对此分支做 QA\",\"built_but_pods_cannot_run_on_this_host_preview_i\":\"已构建 — 但此主机无法运行 pod；改用 ./dev-backend.sh 预览\",\"cancel\":\"取消\",\"cancel_staged_cutover\":\"取消已暂存的切换\",\"cancel_staged_cutover_2\":\"取消已暂存的切换？\",\"cannot_remove_the_main_worktree\":\"无法移除主工作树\",\"cannot_resolve_worktree_path_for_name\":\"无法解析 {{name}} 的工作树路径\",\"close\":\"关闭\",\"closed_has_unmerged_commits\":\"已关闭的 PR — 有不在 main 上的提交\",\"closed_pr_not_on_main_hint\":\"PR 已关闭且未合并 — 其内容不在 main 上，删除后将永久丢失。请在选择前逐一确认。\",\"collapse\":\"折叠\",\"commits\":\"提交：\",\"commits_behind_main\":\"落后 main 的提交数\",\"commits_behind_main_2_other\":\"落后 main {{count}} 个提交\",\"confirm\":\"确认\",\"conflicts_aborted\":\"有冲突 — 已中止\",\"created_recently\":\"最近创建\",\"current_step\":\"当前步骤\",\"cutover_staged_run_cmd_to_finish_or_cancel\":\"切换已暂存：网关下次启动时此工作树将成为运行版本。运行 `{{cmd}}` 完成切换，或使用此行菜单 → 取消已暂存的切换来撤销。在此之前网关仍运行之前的检出。\",\"cutover_staged_run_the_restart_command_to_finish\":\"Cutover staged: this worktree becomes live when the gateway next starts. Run `{{cmd}}` to finish it — the gateway is still running the previous checkout until then.\",\"delete_anyway\":\"仍然删除\",\"design_docs\":\"设计文档：\",\"dev_fleet\":\"开发机群\",\"discard_untracked_files\":\"同时会丢弃未跟踪的文件（{{count}} 个），包括：{{files}}\",\"discovery_error\":\"发现错误\",\"disk\":\"磁盘：\",\"disk_usage_unavailable\":\"磁盘用量不可用\",\"disk_worktrees\":\"磁盘（工作树）\",\"dismiss\":\"忽略\",\"dismiss_sync_status\":\"忽略同步状态\",\"each_row_below_is_a_git_worktree_discovered_from\":\"下面每一行都是从主检出中发现的 git 工作树。使用\",\"empty_worktree_cannot_be_undone\":\"空工作树。无法撤销。\",\"every_git_worktree_of_the_main_checkout_pull_bui\":\"主检出下的每个 git 工作树。拉取+构建会同步 main；pod 是从工作树启动的独立网关。\",\"expand\":\"展开\",\"failed\":\"失败\",\"failed_to_load_logs\":\"加载日志失败\",\"fetches_latest_main_and_replays_refused_if_dirty\":\"拉取最新的 main 并重放提交。有未提交改动时会拒绝；发生冲突时中止变基。\",\"filter_worktrees\":\"筛选工作树…\",\"filter_worktrees_2\":\"筛选工作树\",\"finished\":\"已完成\",\"force_remove\":\"强制移除 {{name}}\",\"force_remove_confirm_desc_other\":\"{{count}} 个工作树存在未合并或未提交的改动。移除后将永久删除所有本地更改，无法撤销。\",\"force_remove_confirm_title\":\"强制移除工作树？\",\"force_remove_warning\":\"所选工作树存在未合并的改动 — 移除是永久性的，无法撤销。\",\"gateway_did_not_come_back_within_60s_reload_the\":\"网关在 60 秒内未恢复 — 手动重新加载页面，或查看 `kirocrew logs`。\",\"gateway_restarted_mid_sync_run_lost_check_git_st\":\"网关在同步中重启 — 本次运行已丢失；检查 git 状态并重新运行拉取+构建\",\"git_status_failed\":\"git status 失败\",\"has_unmerged_work_removing_deletes_permanently\":\"存在未合并的改动 — 移除会永久删除。\",\"hide_legacy_worktrees\":\"隐藏 {{n}} 个旧版工作树\",\"hide_logs\":\"隐藏日志\",\"issues\":\"问题：\",\"keep_cutover\":\"保留切换\",\"keeps_name_the_live_target_and_discards_the_stag\":\"“{{name}}” 仍为运行版本，切换到 “{{staged}}” 的暂存操作将被丢弃。不会重启任何进程 — 网关继续运行当前代码。\",\"keeps_the_live_checkout_the_live_target_and_disc\":\"运行中的检出仍为运行版本，切换到 {{staged}} 的暂存操作将被丢弃（不会重启）\",\"keeps_this_checkout_the_live_target_and_discards\":\"此检出仍为运行版本，切换到 “{{staged}}” 的暂存操作将被丢弃（不会重启）\",\"kept\":\"已保留\",\"kept_discard_untracked_hint\":\"仅因未跟踪暂存文件而被卡住的行：勾选其中一行会丢弃该行所列出的文件。\",\"kept_force_hint\":\"勾选以强制移除 — 将删除未合并的工作。\",\"last_commit_activity\":\"最近提交活动\",\"legacy_worktrees_hidden_show\":\"已隐藏 {{n}} 个旧版工作树 · 展开\",\"live\":\"实时\",\"live_checkout_changed_to_name\":\"仪表板现在使用“{{name}}”。\",\"live_state_unknown\":\"无法获取在线状态\",\"live_state_unknown_help\":\"网关无法报告哪个检出处于在线（即网关自身运行所用的检出）或已暂存状态，因此没有任何行被标记为在线——这是“未知”，而不是“空”。在将任何检出设为在线之前，请先询问智能体。\",\"live_unverified\":\"实时？\",\"load_pod_logs\":\"加载 pod 日志\",\"loading\":\"正在加载…\",\"log\":\"日志 ▴\",\"log_2\":\"日志 ▾\",\"main\":\"· main\",\"make_live\":\"设为运行版本\",\"make_live_failed\":\"设为运行版本失败\",\"make_name_live\":\"将“{{name}}”设为运行版本？\",\"manage_the_git_worktrees_of_your_main_checkout_s\":\"在一处管理主检出的 git 工作树 — 同步、变基、QA pod 和清理。\",\"marked_live_but_this_install_cant_confirm_it\":\"打包安装：无法确认正在运行此检出。\",\"more_actions\":\"更多操作\",\"moves_a_feature_branch_onto_the_latest_main_and\":\"将功能分支变基到最新的 main，而\",\"needs_provision\":\"需要预配\",\"no_candidates_found\":\"未找到候选项。\",\"no_checkout_found\":\"未找到 {{productName}} 检出目录\",\"no_checkout_found_action\":\"在 {{productName}} 数据目录（默认为 ~/.kiro/crew）的 config.json 中添加 dev_fleet.repo_path，本页会在下次刷新时读取该路径。下方环境变量同样可用，但网关启动后才设置的变量对它不可见，因此该方式需要重启。\",\"no_checkout_found_env_example\":\"KIROCREW_DEVFLEET_REPO=/检出目录/路径\",\"no_checkout_found_help\":\"Dev Fleet 管理 {{productName}} 源码检出目录里的 git worktree。项目目录、为此仪表板提供服务的检出目录以及常见克隆位置中都没有找到。\",\"no_commits_stale\":\"无提交，已过时\",\"no_venv_ui_build_yet_provision_builds_this_workt\":\"尚无 venv/UI 构建 — 预配会构建此工作树，让 pod 能够运行\",\"no_worktrees_found\":\"未找到工作树\",\"not_built\":\"未构建\",\"nothing_selected\":\"未选择任何项\",\"nothing_to_prune\":\"没有可清理的项\",\"nothing_under_the_worktrees_root_yet\":\"工作树根目录下暂无内容。\",\"on_the_main_row_to_fast_forward_it_from_origin_a\":\"在 main 行上，从 origin 快进并重新构建\\n              （然后重启网关以生效）。\",\"open\":\"打开\",\"orphan_pods_label\":\"孤立 Pod 主目录：{{value}}\",\"parked_on_branch\":\"停留在 {{branch}}\",\"pending\":\"待处理\",\"pod\":\"pod\",\"pod_2\":\"Pod\",\"pod_and_make_live_actions_are_hidden_everything\":\"pod 和“设为运行版本”操作已隐藏；本页其余功能正常。\",\"pod_cpu\":\"CPU：{{value}}\",\"pod_cpu_usage\":\"Pod CPU 使用率\",\"pod_home_disk\":\"Pod 主目录磁盘：{{value}}\",\"pod_home_size\":\"Pod 主目录：{{value}}\",\"pod_homes_left_on_disk_with_no_live_pod\":\"磁盘上没有对应运行 Pod 的遗留主目录\",\"pod_memory\":\"内存：{{value}}\",\"pod_memory_of_ceiling\":\"Pod 已用内存与其 cgroup 上限对比\",\"pod_running_on\":\"Pod：运行于：\",\"pod_sick\":\"pod 异常\",\"pod_start_failed\":\"pod 启动失败\",\"pod_task_chip_other\":\"{{n}} 个任务\",\"pod_task_count\":\"Pod cgroup 中的任务数\",\"pod_tasks\":\"任务：{{value}}\",\"pod_up\":\"pod 运行中\",\"pod_up_name\":\"pod 已启动：{{name}}\",\"pods_are_unavailable_on_this_host\":\"此主机不支持 pod。\",\"pr\":\"PR：\",\"pr_2\":\"PR\",\"pr_closed_but_branch_has_newer_commits\":\"PR 已关闭 — 分支上有更新的提交\",\"pr_closed_but_verification_unavailable_retry\":\"PR 已关闭，但无法验证 — 重试\",\"pr_closed_not_on_main\":\"PR 已关闭 — 不在 main 上\",\"pr_closed_uncommitted_changes\":\"PR 已关闭 — 存在未提交的更改\",\"pr_merged\":\"PR 已合并\",\"pr_merged_but_new_commits_pushed_after_merge\":\"PR 已合并，但合并后又推送了新提交\",\"pr_merged_but_verification_unavailable_retry\":\"PR 已合并，但无法验证 — 重试\",\"pr_merged_safe_to_remove_runs_git_worktree_remov\":\"PR 已合并 — 可以安全移除。会执行 `git worktree remove`。无法撤销。\",\"pr_merged_uncommitted_changes\":\"PR 已合并，存在未提交改动\",\"pr_open_or_unmerged_commits\":\"PR 未关闭或存在未合并提交\",\"pr_state_closed\":\"已关闭\",\"pr_state_merged\":\"已合并\",\"pr_state_open\":\"已打开\",\"protected_worktree\":\"受保护 — 主工作树或当前正在运行\",\"provision\":\"预配\",\"provision_failed\":\"预配失败\",\"provision_failed_exit_code\":\"预配失败（退出码 {{code}}）\",\"provision_failed_status\":\"预配失败（{{status}}）\",\"provision_failed_to_start\":\"预配启动失败\",\"provision_polling_timed_out_check_pod_logs\":\"预配轮询超时 — 查看 pod 日志\",\"provision_timed_out\":\"预配超时\",\"provisioned\":\"已预配\",\"provisioning\":\"预配中\",\"prune\":\"清理\",\"prune_complete\":\"清理完成\",\"prune_failed_count_other\":\"清理失败：{{count}} 个\",\"prune_failed_to_start\":\"清理启动失败\",\"prune_merged\":\"清理已合并\",\"prune_preview_failed\":\"清理预览失败\",\"prune_worktrees\":\"清理工作树\",\"pruned_worktrees_other\":\"已清理 {{count}} 个工作树\",\"pruned_worktrees_some_failed_other\":\"已清理 {{count}} 个工作树（{{failed}} 个失败）\",\"pruning_worktrees\":\"正在清理工作树\",\"pull_build\":\"拉取 + 构建\",\"pull_build_2\":\"拉取+构建\",\"pull_build_failed\":\"拉取+构建失败\",\"pull_build_failed_exit_code_detail\":\"拉取+构建失败（退出码 {{code}}）：{{detail}}\",\"pull_build_failed_to_start\":\"拉取+构建启动失败\",\"pull_build_main\":\"拉取 + 构建 main\",\"pulls_main_and_rebuilds_6_min_does_not_restart\":\"拉取基础分支并重新构建（约 6 分钟）。不会重启。\",\"pulls_main_rebuilds_then_restarts_keep_page_open\":\"拉取基础分支，重新构建（约6分钟），然后自动重启网关。请保持此页面打开直到构建完成。\",\"purpose\":\"用途：\",\"qa_pod_is_running_but_failing_its_health_check\":\"QA pod 正在运行，但健康检查未通过\",\"qa_pod_is_running_click_open_to_use_it\":\"QA pod 正在运行 — 点击“打开”即可使用\",\"qa_video\":\"QA + 视频\",\"rebase\":\"变基\",\"rebase_conflicts\":\"变基冲突\",\"rebase_failed\":\"变基失败\",\"rebase_name\":\"对“{{name}}”执行变基？\",\"rebase_onto_main\":\"变基到基础分支\",\"rebased_head\":\"已变基（HEAD {{head}}）\",\"refresh\":\"刷新\",\"refresh_fleet\":\"刷新机群\",\"remove\":\"移除\",\"remove_closed_pr\":\"移除 — 已关闭的 PR（不在 main 上）\",\"remove_name\":\"移除“{{name}}”？\",\"remove_selected\":\"移除所选\",\"removed\":\"已移除\",\"removed_name\":\"已移除 {{name}}\",\"removes_worktrees_and_stops_pods_cannot_be_undon\":\"移除工作树并停止 pod。无法撤销。\",\"removing\":\"正在移除\",\"repoint_the_live_gateway_at_this_worktree_restar\":\"把运行中的网关重新指向此工作树（会重启网关）\",\"repoint_the_live_gateway_back_at_main_restarts_t\":\"将运行中的网关重新指向 main（会重启网关）\",\"restart\":\"重启\",\"restart_failed\":\"重启失败\",\"restart_gateway\":\"重启网关\",\"restart_gateway_2\":\"要重启网关吗？\",\"restart_gateway_to_apply_the_new_build\":\"重启网关以应用新构建\",\"restart_pending\":\"Restart pending\",\"restart_pod\":\"重启 pod\",\"restarted_name\":\"已重启 {{name}}\",\"restarting_completes_the_pending_cutover_boots\":\"重启将完成待定的切换：网关将在“{{staged}}”上启动，而不是当前检出。仪表板会短暂断开并自动重连。如需撤销，请使用“取消已暂存的切换”。\",\"restarting_reconnecting\":\"正在重启 — 正在重连…\",\"rows_count_other\":\"{{n}} 行\",\"rows_filtered_count_other\":\"{{shown}} / {{n}} 行\",\"running_pods\":\"运行中的 pod\",\"safely_removes_worktrees_whose_pr_has_already_me\":\"可安全移除 PR 已合并的工作树。\",\"scanning_merged\":\"正在扫描已合并…\",\"select\":\"选择 {{name}}\",\"sort_behind\":\"排序：落后\",\"sort_name\":\"排序：名称\",\"sort_recent\":\"排序：最近\",\"sort_status\":\"排序：状态\",\"sort_worktrees\":\"排序工作树\",\"spin_up_pod\":\"启动 pod\",\"stages_name_as_the_live_target_to_finish_the_undo\":\"在运行 `{{cmd}}` 之前，仪表板会继续使用当前版本。重启后，它将使用“{{name}}”，网址和数据保持不变；此页面不会自动重新连接。\",\"stages_the_code_behind_the_live_dashboard_manual\":\"Stages this worktree as the live target (same port, same data). Dev Fleet cannot restart this gateway, so the swap takes effect when you run `{{cmd}}` yourself — this page will NOT reconnect on its own. Refused unless the worktree is provisioned and built.\",\"start\":\"启动\",\"starting\":\"正在启动…\",\"starting_pod_for_name_can_take_1_min\":\"正在为 {{name}} 启动 pod…（可能需要约 1 分钟）\",\"stop_pod\":\"停止 pod\",\"stopped_name\":\"已停止 {{name}}\",\"stopping_pod\":\"正在停止 pod\",\"swaps_the_code_behind_the_live_dashboard_to_this\":\"把运行中的仪表板背后的代码切换到此工作树（端口和数据不变）。网关会重启，本页面自动重连。除非此工作树已预配并构建，否则会拒绝。\",\"switches_the_live_dashboard_back_to_name_and_restarts\":\"将仪表板切换回“{{name}}”（网址和数据不变）。仪表板会短暂重启，此页面将自动重新连接。\",\"sync_progress\":\"同步进度\",\"sync_run_lost_gateway_restarted_mid_sync_re_run\":\"同步运行已丢失（网关在同步中重启）。重新运行拉取+构建。\",\"synced\":\"已同步\",\"synced_restart_gateway_to_apply_the_new_build\":\"已同步 — 重启网关以应用新构建。\",\"syncing\":\"同步中\",\"the_live_gateway_on_this_port_runs_from_this_che\":\"此端口上运行的网关来自此检出\",\"the_primary_checkout_is_on_branch_not_base\":\"主检出当前位于 {{branch}}，而不是 {{base}}。在切换回 {{base}} 之前，拉取 + 构建将拒绝同步。\",\"the_primary_checkout_this_fleet_is_discovered_fr\":\"此机群的发现来源，即主检出\",\"tickets\":\"工单：\",\"toggle_log\":\"切换日志\",\"toggle_provision_log\":\"切换预配日志\",\"token_mint_failed\":\"令牌签发失败\",\"total_disk_used_by_running_pod_homes\":\"运行中 Pod 主目录占用的磁盘总量\",\"uncommitted_changes\":\"未提交的更改\",\"undo_make_live_failed\":\"无法将仪表板切换回之前的版本\",\"undo_to_name\":\"切换回 {{name}}\",\"up_to_date_with_main\":\"已与 main 同步\",\"updated\":\"已更新\",\"verifying\":\"正在验证\",\"waiting_for_the_new_gateway_process_the_page_rel\":\"正在等待新的网关进程。启动后页面会自动刷新。\",\"worktree\":\"工作树\",\"worktrees\":\"工作树\",\"worktrees_count\":\"工作树（{{count}}）\",\"worktrees_created_under_a_previous_repository_na\":\"在旧仓库名下创建的工作树。默认隐藏；仍在“清理已合并”范围内。\"}}")
	}
};
var own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
function lookup(catalog, key) {
	let node = catalog;
	for (const part of key.split(".")) {
		if (node === void 0 || typeof node === "string" || !own(node, part)) return void 0;
		node = node[part];
	}
	return typeof node === "string" ? node : void 0;
}
/** The catalogs to try for `locale`, most specific first, always ending in English. */
function localeChain(locale) {
	const chain = [];
	const add = (candidate) => {
		if (own(CATALOGS, candidate) && !chain.includes(candidate)) chain.push(candidate);
	};
	add(locale);
	add(locale.split("-")[0]);
	add("en");
	return chain;
}
function currentLocale() {
	try {
		const locale = activeLocale();
		return typeof locale === "string" && locale ? locale : "en";
	} catch {
		return "en";
	}
}
var PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g;
function pluralSuffix(locale, count) {
	try {
		return new Intl.PluralRules(locale).select(count);
	} catch {
		return "other";
	}
}
/**
* The product name the dashboard's catalogs render as `{{productName}}`. The stock
* dashboard resolves it to "Kiro Crew"; an edition may rename it, which the App
* SDK does not expose to a bundle, so this page always says "Kiro Crew".
*/
var PRODUCT_NAME = "Kiro Crew";
function fill(text, vars) {
	return text.replace(PLACEHOLDER, (whole, name) => {
		if (vars && own(vars, name) && vars[name] != null) return String(vars[name]);
		return name === "productName" ? PRODUCT_NAME : whole;
	});
}
function t(key, vars) {
	const count = vars && typeof vars.count === "number" ? vars.count : void 0;
	for (const locale of localeChain(currentLocale())) {
		const catalog = CATALOGS[locale];
		if (count !== void 0) {
			const forms = [`${key}_${pluralSuffix(locale, count)}`, `${key}_other`];
			for (const form of forms) {
				const text = lookup(catalog, form);
				if (text !== void 0) return fill(text, vars);
			}
		}
		const text = lookup(catalog, key);
		if (text !== void 0) return fill(text, vars);
	}
	return key;
}
/** The name the page's components call `t` by, kept from the built-in. */
var i18nT = t;
// src/devFleetApi.ts
var BASE = "/apps/dev-fleet/api";
var GATEWAY_BASE = "/api/apps/dev-fleet";
var bound = null;
/** Bind the host's scoped client. The root component calls it on every render. */
function bindAppApi(api) {
	bound = api;
}
function client() {
	if (!bound) throw new Error("Dev Fleet API used before the page bound the host client");
	return bound;
}
var DevFleetApiError = class extends Error {
	status;
	body;
	/** The refusal came from an access proxy in front of the gateway, not the gateway. */
	edgeChallenge;
	constructor(status, message, body, edgeChallenge = false) {
		super(message);
		this.name = "DevFleetApiError";
		this.status = status;
		this.body = body;
		this.edgeChallenge = edgeChallenge;
	}
};
var HTML_DOCUMENT_START = /^<(?:!doctype\s|html[\s>])/i;
var looksLikeHtmlDocument = (body) => HTML_DOCUMENT_START.test(body.trim());
/**
* An access proxy's sign-in page: a 401/403 whose body is an HTML document. The
* dashboard's own client also reads the content type; the host's scoped-client
* error carries only the status and the body, so the body decides here.
*/
var isEdgeChallenge = (status, body) => (status === 401 || status === 403) && looksLikeHtmlDocument(body);
/** The dashboard's `friendlyErrText` / `statusErrText` order, for this app's refusals. */
function messageOf(status, body) {
	if (isEdgeChallenge(status, body)) return i18nT("api.client.proxy_challenge_reload");
	const trimmed = body.trim();
	try {
		const parsed = JSON.parse(trimmed);
		for (const field of [
			parsed?.error,
			parsed?.detail,
			parsed?.message
		]) if (typeof field === "string" && field) return field;
	} catch {}
	if (trimmed && !looksLikeHtmlDocument(trimmed)) return body;
	return (status === 502 || status === 503) && looksLikeHtmlDocument(body) ? i18nT("api.client.server_temporarily_unavailable_http_status", { status }) : `HTTP ${status}`;
}
function translate(e) {
	const err = e;
	if (err && err.name === "AppApiError" && typeof err.status === "number") {
		const body = typeof err.body === "string" ? err.body : "";
		throw new DevFleetApiError(err.status, messageOf(err.status, body), body, isEdgeChallenge(err.status, body));
	}
	throw e;
}
async function request(path, opts, base = BASE) {
	try {
		return await client().request(base + path, {
			credentials: "same-origin",
			...opts
		});
	} catch (e) {
		return translate(e);
	}
}
function get(path) {
	return request(path);
}
function post(path, body) {
	return request(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});
}
/** POST to a route the GATEWAY process serves (`/api/apps/dev-fleet/...`). */
function postGateway(path, body) {
	return request(path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	}, GATEWAY_BASE);
}
/** The backend's restart-handshake health (`/apps/dev-fleet/api/health`), unparsed. */
function rawHealth(signal) {
	return client().raw(`${BASE}/health`, {
		credentials: "same-origin",
		signal
	});
}
/** This app's backend status from the host's app list, or null when it cannot be read. */
async function backendStatus() {
	const apps = await request("", void 0, "/api/apps");
	return (Array.isArray(apps) ? apps.find((a) => a.name === "dev-fleet") : void 0)?.backend_status ?? null;
}
// src/host/ui.tsx
/**
* The dashboard components the page uses. Those the App SDK exports
* (`@kirocrew/app-sdk/ui`) are the host's own, re-exported unchanged. Two are not
* in the SDK and are local:
*
* - `Checkbox`, the dashboard's bare themed checkbox, copied as is;
* - `SimpleSelect`, the dashboard's Radix select, here a themed native `<select>`
*   with the same props the page passes (options, labels, value, onChange and an
*   accessible name). Its open list is drawn by the browser.
*/
var Checkbox = forwardRef(({ style, ...rest }, ref) => /* @__PURE__ */ jsx("input", {
	ref,
	type: "checkbox",
	style: {
		margin: 0,
		accentColor: "var(--accent)",
		cursor: "pointer",
		...style
	},
	...rest
}));
Checkbox.displayName = "Checkbox";
var SELECT_STYLE = {
	height: 32,
	padding: "0 28px 0 10px",
	borderRadius: 8,
	border: "1px solid var(--border)",
	background: "var(--card)",
	color: "var(--text)",
	fontSize: 13,
	cursor: "pointer"
};
function SimpleSelect({ options, optionLabels, value, onChange, className, style, ...rest }) {
	return /* @__PURE__ */ jsx("select", {
		className,
		style: {
			...SELECT_STYLE,
			...style
		},
		value,
		onChange: (e) => onChange(e.target.value),
		...rest,
		children: options.map((opt, i) => /* @__PURE__ */ jsx("option", {
			value: opt,
			children: optionLabels?.[i] ?? opt
		}, opt))
	});
}
// src/host/backendStatus.ts
/**
* Banner copy for an app whose backend is repeatedly failing to restart: the
* dashboard's `utils/backendStatus`, copied, with its two strings in this app's
* own catalogs (`apps.backend.*`).
*/
function restartExhaustedNotice(appLabel, status) {
	const exhausted = status?.restart_exhausted;
	if (!exhausted) return null;
	const count = Number.isFinite(exhausted.attempts) && exhausted.attempts > 0 ? Math.floor(exhausted.attempts) : 1;
	return {
		title: i18nT("apps.backend.restart_exhausted_title", { app: appLabel }),
		message: i18nT("apps.backend.restart_exhausted_message", {
			app: appLabel,
			count
		})
	};
}
// src/host/format.ts
/**
* Locale formatting. `fmtNumber`, `fmtRelative` and `compareText` are the host's
* own, from the App SDK. `fmtUnit`, `fmtBytes` and `fmtPercent` are the
* dashboard's (`i18n/format.ts`), which the SDK does not export; they are built
* here on the SDK's `fmtNumber`, with the same rules.
*/
/** A ratio as a percentage (`0.42` -> `42%`). */
function fmtPercent(ratio, options) {
	if (!Number.isFinite(ratio)) return "—";
	return fmtNumber(ratio, {
		style: "percent",
		maximumFractionDigits: 0,
		...options
	});
}
/**
* A quantity with its unit, never broken across lines: every plain space in the
* formatted value becomes U+00A0, so all 12 locales wrap the same way.
*/
function fmtUnit(value, unit, options) {
	if (!Number.isFinite(value)) return "—";
	return fmtNumber(value, {
		style: "unit",
		unit,
		unitDisplay: "narrow",
		...options
	}).replace(/ /g, "\xA0");
}
function roundToDigits(value, digits) {
	const step = 10 ** digits;
	return Math.sign(value) * Math.round(Math.abs(value) * step) / step;
}
/** Bytes in base-1000 units (`1.2 GB`), as the dashboard shows them. */
function fmtBytes(bytes, options) {
	if (!Number.isFinite(bytes)) return "—";
	const digits = options?.maximumFractionDigits;
	const b = roundToDigits(bytes, digits ?? 0);
	if (Math.abs(b) < 1e3) return fmtUnit(b, "byte", {
		maximumFractionDigits: 0,
		...options
	});
	const kb = roundToDigits(bytes / 1e3, digits ?? 1);
	if (Math.abs(kb) < 1e3) return fmtUnit(kb, "kilobyte", {
		maximumFractionDigits: 1,
		...options
	});
	const mb = roundToDigits(bytes / 1e3 ** 2, digits ?? 1);
	if (Math.abs(mb) < 1e3) return fmtUnit(mb, "megabyte", {
		maximumFractionDigits: 1,
		...options
	});
	const gb = roundToDigits(bytes / 1e3 ** 3, digits ?? 1);
	if (Math.abs(gb) < 1e3) return fmtUnit(gb, "gigabyte", {
		maximumFractionDigits: 1,
		...options
	});
	return fmtUnit(bytes / 1e3 ** 4, "terabyte", {
		maximumFractionDigits: 1,
		...options
	});
}
// src/devFleetPageModel.ts
/**
* The Dev Fleet page's React-free model: the fleet payload types, the sync
* step-marker protocol and its failure tail, the restart identity handshake and
* its route-independent watcher, the provision progress model, the prune
* verdict and status labels, the Switch back dismissal receipt and the small
* formatters the rows use.
*/
var UNDO_DISMISSED_STORAGE_KEY = "kc-dev-fleet-undo-dismissed";
function readDismissedUndoKey() {
	try {
		return window.sessionStorage.getItem(UNDO_DISMISSED_STORAGE_KEY);
	} catch {
		return null;
	}
}
function persistDismissedUndoKey(key) {
	try {
		if (key == null) window.sessionStorage.removeItem(UNDO_DISMISSED_STORAGE_KEY);
		else window.sessionStorage.setItem(UNDO_DISMISSED_STORAGE_KEY, key);
	} catch {}
}
var POLL_MS = 12e3;
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var STEP_MARKER_RE = /^::step::(\d+)::(.+)$/;
var STEPERR_MARKER_RE = /^::steperr::(\d+)::([\s\S]*)$/;
function filterStepMarkers(lines) {
	return lines.filter((l) => !STEP_MARKER_RE.test(l) && !STEPERR_MARKER_RE.test(l));
}
/**
* The failure text for a finished sync OR provision run, from its output alone.
*
* Both runners emit the same `::steperr::` markers for the step that failed, so
* the two failure notices are named by one rule rather than two.
*
* Prefers the failing step's stderr tail (`::steperr::`) over the last output
* line. The last line is only a good guess when the failing process wrote
* nothing to stdout: npm prints its diagnosis FIRST and its "a complete log of
* this run can be found in ..." pointer LAST, and git prints `Updating a..b` to
* stdout before a refused fast-forward errors on stderr -- so in both cases the
* final line is the least informative one produced. Falls back to that last-line
* rule for a run from a gateway that emits no `::steperr::` markers.
*/
function syncFailureTail(out) {
	const stderrTail = out.map((l) => STEPERR_MARKER_RE.exec(l)?.[2]).filter((t) => !!t && !!t.trim());
	if (stderrTail.length) return stderrTail.join("\n");
	return [...out].reverse().find((l) => l?.trim() && !STEP_MARKER_RE.test(l) && !STEPERR_MARKER_RE.test(l)) || "";
}
var RESTART_TIMEOUT_MS = 6e4;
function gatewayRecovered(capturedId, currentId) {
	if (capturedId == null || currentId == null) return false;
	return String(currentId) !== String(capturedId);
}
var _restartAc = null;
var _activeSyncPolls = /* @__PURE__ */ new Set();
/**
* Poll the gateway's health endpoint until it comes back with a different
* start_id, then reload the page. Route-independent: survives React unmount.
*/
async function awaitGatewayBackGlobal(capturedId) {
	_restartAc?.abort();
	const ac = new AbortController();
	_restartAc = ac;
	const deadline = Date.now() + RESTART_TIMEOUT_MS;
	await sleep(3e3);
	while (Date.now() < deadline) {
		if (ac.signal.aborted) return "aborted";
		try {
			if (capturedId == null) {
				await fetch("/", { signal: AbortSignal.timeout(3e3) });
				window.location.reload();
				return "reloaded";
			}
			if (gatewayRecovered(capturedId, (await (await rawHealth(AbortSignal.timeout(3e3))).json().catch(() => null))?.start_id)) {
				window.location.reload();
				return "reloaded";
			}
		} catch (e) {
			if ((e?.name === "AppApiError" ? e.status : void 0) === 404) {
				window.location.reload();
				return "reloaded";
			}
		}
		await sleep(2e3);
	}
	return "timeout";
}
function lastLine(lines) {
	if (!lines) return "";
	for (let i = lines.length - 1; i >= 0; i--) {
		const l = lines[i];
		if (l?.trim() && !STEPERR_MARKER_RE.test(l)) return l;
	}
	return "";
}
function provPhase(lines) {
	if (!lines) return null;
	for (let i = lines.length - 1; i >= 0; i--) {
		const l = (lines[i] || "").toLowerCase();
		if (l.includes("building dist") || l.includes("npm run build") || l.includes("vite") || l.includes("tsc ")) return "dist";
		if (l.includes("creating venv") || l.includes("pip install") || l.includes("venv")) return "venv";
	}
	return null;
}
/**
* Map a machine prune verdict code to a human-readable reason. Used both for
* candidate rows and for surfacing WHY a kept row was not pruned. Exported so
* the mapping can be unit-tested directly.
*/
function pruneVerdictLabel(code) {
	switch (code) {
		case "merged": return i18nT("pages.devFleetPage.pr_merged");
		case "closed": return i18nT("pages.devFleetPage.pr_closed_not_on_main");
		case "closed_dirty": return i18nT("pages.devFleetPage.pr_closed_uncommitted_changes");
		case "closed_new_commits": return i18nT("pages.devFleetPage.pr_closed_but_branch_has_newer_commits");
		case "closed_unverified": return i18nT("pages.devFleetPage.pr_closed_but_verification_unavailable_retry");
		case "empty": return i18nT("pages.devFleetPage.no_commits_stale");
		case "merged_dirty": return i18nT("pages.devFleetPage.pr_merged_uncommitted_changes");
		case "fresh": return i18nT("pages.devFleetPage.created_recently");
		case "active": return i18nT("pages.devFleetPage.pr_open_or_unmerged_commits");
		case "merged_new_commits": return i18nT("pages.devFleetPage.pr_merged_but_new_commits_pushed_after_merge");
		case "merged_unverified": return i18nT("pages.devFleetPage.pr_merged_but_verification_unavailable_retry");
		case "dirty_check_failed": return i18nT("pages.devFleetPage.git_status_failed");
		default: return code || "";
	}
}
var PRUNE_STATUS_META = {
	pending: { kind: "idle" },
	verifying: { kind: "spin" },
	stopping_pod: { kind: "spin" },
	removing: { kind: "spin" },
	done: { kind: "done" },
	failed: { kind: "failed" }
};
/**
* Catalog KEY for each prune status's chip label — kept in its own flat table,
* beside PRUNE_STATUS_META (add a status to both).
*
* Keys, not strings: this is module scope, evaluated once at import, so an
* `i18nT()` call here would freeze the boot language. `pruneStatusLabel()` does
* the lookup during render. Flat `Record` of full literal keys indexed inline at
* the `i18nT()` call, because that is the form `scripts/check-i18n-keys.mjs` can
* resolve statically. `removing` / `failed` reuse the keys this page already
* ships for those two words rather than adding duplicates.
*/
var PRUNE_STATUS_LABEL_KEY = {
	pending: "pages.devFleetPage.pending",
	verifying: "pages.devFleetPage.verifying",
	stopping_pod: "pages.devFleetPage.stopping_pod",
	removing: "pages.devFleetPage.removing",
	done: "pages.devFleetPage.removed",
	failed: "pages.devFleetPage.failed"
};
/** Localised chip label for a prune status, falling back to the `pending` copy for
*  the same reason the caller falls back to its meta — the status arrives from the
*  /api/run poll, so an unrecognised value must still render something.
*
*  `hasOwnProperty`, not `in`: a status of `toString` would otherwise resolve to an
*  inherited Object.prototype member and hand a function to i18next. */
function pruneStatusLabel(status) {
	return Object.prototype.hasOwnProperty.call(PRUNE_STATUS_LABEL_KEY, status) ? i18nT(PRUNE_STATUS_LABEL_KEY[status]) : i18nT(PRUNE_STATUS_LABEL_KEY.pending);
}
function fmtElapsed(ms) {
	const s = Math.max(0, Math.floor(ms / 1e3));
	return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}
function memColor(current, max) {
	if (current == null || max == null || max <= 0) return "var(--muted)";
	const ratio = current / max;
	if (ratio >= .9) return "var(--danger)";
	if (ratio >= .75) return "var(--warn)";
	return "var(--muted)";
}
// src/host/overlay.tsx
function OverlayPortal({ children }) {
	return createPortal(children, document.body);
}
// src/host/keyboard.ts
/**
* Keyboard helpers the built-in page took from the dashboard's own hooks
* (`hooks/useImeGuard`, `hooks/useMenuKeyboard`, `hooks/useDialogFocusTrap`).
* A bundle cannot import those, and the App SDK exports only `useImeGuard`, so the
* parts the page uses are copied here with the same behaviour. The dashboard's
* "crew overlay hidden" signal has no bundle-side equivalent; a page an app hosts
* is never under that overlay, so the hooks run whenever they are enabled.
*/
var POST_COMPOSITION_MS = 50;
var HANGUL = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]$/;
/** True from compositionstart until 50 ms after compositionend (Hangul: at once). */
function createImeLatch() {
	let latched = false;
	let timer;
	return {
		onCompositionStart() {
			clearTimeout(timer);
			latched = true;
		},
		onCompositionEnd(data) {
			if (data && HANGUL.test(data)) {
				clearTimeout(timer);
				latched = false;
				return;
			}
			latched = true;
			timer = setTimeout(() => {
				latched = false;
			}, POST_COMPOSITION_MS);
		},
		isLatched: () => latched,
		reset() {
			clearTimeout(timer);
			latched = false;
		},
		claimKey(e) {
			if (!(latched || e.isComposing || e.keyCode === 229)) return true;
			if (!e.isComposing && e.keyCode !== 229) e.preventDefault();
			e.stopPropagation();
			return false;
		}
	};
}
/** A latch fed by document-level composition events while `enabled`. */
function useDocumentImeLatch(enabled = true) {
	const latchRef = useRef();
	if (!latchRef.current) latchRef.current = createImeLatch();
	const latch = latchRef.current;
	useEffect(() => {
		if (!enabled) return;
		latch.reset();
		const onCompositionStart = () => latch.onCompositionStart();
		const onCompositionEnd = () => latch.onCompositionEnd();
		const onRecover = () => latch.reset();
		document.addEventListener("compositionstart", onCompositionStart, true);
		document.addEventListener("compositionend", onCompositionEnd, true);
		document.addEventListener("focusout", onRecover, true);
		return () => {
			document.removeEventListener("compositionstart", onCompositionStart, true);
			document.removeEventListener("compositionend", onCompositionEnd, true);
			document.removeEventListener("focusout", onRecover, true);
			latch.reset();
		};
	}, [enabled, latch]);
	return latch;
}
/** Arrow/Home/End roving focus and Tab wrap for a menu. True when the key was handled. */
function handleMenuKeydown(e, getItems, imeLatch) {
	if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
		if (e.altKey || e.ctrlKey || e.metaKey) return false;
		const focusable = getItems();
		if (focusable.length === 0) return false;
		if (!imeLatch.claimKey(e)) return true;
		e.preventDefault();
		if (e.key === "Home") {
			focusable[0].focus();
			return true;
		}
		if (e.key === "End") {
			focusable[focusable.length - 1].focus();
			return true;
		}
		const idx = focusable.indexOf(document.activeElement);
		focusable[idx === -1 ? e.key === "ArrowDown" ? 0 : focusable.length - 1 : (idx + (e.key === "ArrowDown" ? 1 : -1) + focusable.length) % focusable.length].focus();
		return true;
	}
	if (e.key !== "Tab") return false;
	const focusable = getItems();
	if (focusable.length === 0) return false;
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (e.shiftKey && document.activeElement === first) {
		if (!imeLatch.claimKey(e)) return true;
		e.preventDefault();
		last.focus();
		return true;
	}
	if (!e.shiftKey && document.activeElement === last) {
		if (!imeLatch.claimKey(e)) return true;
		e.preventDefault();
		first.focus();
		return true;
	}
	return false;
}
var FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex=\"-1\"])";
var nextTrapOrder = 0;
var armedTabTraps = /* @__PURE__ */ new Set();
var newestArmedTrap = () => Math.max(-1, ...armedTabTraps);
/** Focus the first control, close on Escape, and keep Tab inside `containerRef`. */
function useDialogFocusTrap(containerRef, onEscape, { enabled = true, handleEscape = true, restoreFocus = true } = {}) {
	useEffect(() => {
		const restoreTo = restoreFocus ? document.activeElement : null;
		(Array.from(containerRef.current?.querySelectorAll(FOCUSABLE) ?? []).find((el) => el.tabIndex >= 0) ?? containerRef.current)?.focus({ preventScroll: true });
		return () => restoreTo?.focus?.({ preventScroll: true });
	}, [containerRef, restoreFocus]);
	const imeLatch = useDocumentImeLatch(enabled);
	const mountOrderRef = useRef(0);
	useLayoutEffect(() => {
		mountOrderRef.current = ++nextTrapOrder;
	}, []);
	useLayoutEffect(() => {
		if (!enabled) return;
		const order = mountOrderRef.current;
		armedTabTraps.add(order);
		const onKey = (e) => {
			if (e.key === "Escape" && handleEscape) {
				if (!imeLatch.claimKey(e)) return;
				onEscape();
				return;
			}
			const container = containerRef.current;
			if (e.key !== "Tab" || !container) return;
			if (newestArmedTrap() !== order) return;
			const items = Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null && el.tabIndex >= 0);
			if (!items.length) return;
			const firstEl = items[0];
			const lastEl = items[items.length - 1];
			const active = document.activeElement;
			const wrapsForward = !e.shiftKey && active === lastEl;
			const wrapsBackward = e.shiftKey && (active === firstEl || active === container);
			const refocuses = !wrapsForward && !wrapsBackward && !container.contains(active);
			if (!wrapsForward && !wrapsBackward && !refocuses) return;
			if (!imeLatch.claimKey(e)) return;
			e.preventDefault();
			(wrapsBackward ? lastEl : firstEl).focus();
		};
		window.addEventListener("keydown", onKey, true);
		return () => {
			window.removeEventListener("keydown", onKey, true);
			armedTabTraps.delete(order);
		};
	}, [
		containerRef,
		onEscape,
		enabled,
		handleEscape,
		imeLatch
	]);
}
// src/DevFleetPageMenus.tsx
/**
* The row controls the Dev Fleet page shares: the portaled row-actions menu
* (`MenuBtn`) and the confirm-on-click button with its popover (`ConfirmBtn`).
*/
var MENU_GAP = 6;
var MENU_MARGIN = 8;
var MENU_ITEM_H = 32;
var MENU_PAD = 8;
function MenuBtn({ items }) {
	const [open, setOpen] = useState(false);
	useCallback(() => setOpen(false), []);
	const [rect, setRect] = useState(null);
	const triggerRef = useRef(null);
	const menuRef = useRef(null);
	const itemRefs = useRef([]);
	const visible = items.filter(Boolean);
	const imeLatch = useDocumentImeLatch(open);
	const close = useCallback(() => {
		setOpen(false);
		triggerRef.current?.focus();
	}, []);
	const focusableItems = useCallback(() => itemRefs.current.filter((el, i) => !visible[i]?.disabled && el), [visible]);
	useEffect(() => {
		if (!open) return;
		focusableItems()[0]?.focus();
		const onDown = (e) => {
			const t = e.target;
			if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
		};
		const onKey = (e) => {
			if (e.key === "Escape") {
				if (!imeLatch.claimKey(e)) return;
				close();
				return;
			}
			handleMenuKeydown(e, focusableItems, imeLatch);
		};
		const onScrollOrResize = () => {
			if (menuRef.current?.contains(document.activeElement)) triggerRef.current?.focus({ preventScroll: true });
			setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		window.addEventListener("scroll", onScrollOrResize, true);
		window.addEventListener("resize", onScrollOrResize);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
			window.removeEventListener("scroll", onScrollOrResize, true);
			window.removeEventListener("resize", onScrollOrResize);
		};
	}, [
		open,
		close,
		imeLatch
	]);
	const toggle = () => {
		if (!open && triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
		setOpen((o) => !o);
	};
	const estH = visible.length * MENU_ITEM_H + MENU_PAD;
	const spaceBelow = rect ? window.innerHeight - rect.bottom - MENU_GAP : 0;
	const spaceAbove = rect ? rect.top - MENU_GAP : 0;
	const openUp = !!rect && spaceBelow < estH + MENU_MARGIN && spaceAbove > spaceBelow;
	const avail = Math.max(80, (openUp ? spaceAbove : spaceBelow) - MENU_MARGIN);
	const posStyle = rect ? {
		position: "fixed",
		right: Math.max(MENU_MARGIN, window.innerWidth - rect.right),
		...openUp ? { bottom: window.innerHeight - rect.top + MENU_GAP } : { top: rect.bottom + MENU_GAP },
		maxHeight: avail
	} : { position: "fixed" };
	return /* @__PURE__ */ jsxs("span", {
		style: { display: "inline-flex" },
		children: [/* @__PURE__ */ jsx(Btn, {
			ref: triggerRef,
			onClick: toggle,
			title: i18nT("pages.devFleetPage.more_actions"),
			"aria-label": i18nT("pages.devFleetPage.more_actions"),
			"aria-haspopup": "menu",
			"aria-expanded": open,
			children: /* @__PURE__ */ jsx(Ellipsis, {
				size: 15,
				className: "lucide-inline"
			})
		}), open && rect && /* @__PURE__ */ jsx(OverlayPortal, { children: /* @__PURE__ */ jsx("div", {
			ref: menuRef,
			role: "menu",
			"aria-label": i18nT("pages.devFleetPage.more_actions"),
			"data-placement": openUp ? "up" : "down",
			style: {
				...posStyle,
				zIndex: 4e3,
				overflowY: "auto",
				background: "var(--card, #16161a)",
				border: "1px solid var(--border)",
				borderRadius: 10,
				padding: 4,
				minWidth: 168,
				boxShadow: "0 8px 24px rgba(0,0,0,0.45)"
			},
			children: visible.map((item, i) => /* @__PURE__ */ jsxs(Clickable, {
				ref: (el) => {
					itemRefs.current[i] = el;
				},
				onClick: () => {
					close();
					item.onClick();
				},
				disabled: !!item.disabled,
				style: {
					display: "flex",
					alignItems: "center",
					gap: 8,
					width: "100%",
					textAlign: "left",
					background: "none",
					border: "none",
					borderRadius: 7,
					padding: "7px 10px",
					fontSize: 12,
					color: item.danger ? "var(--danger)" : "var(--text)",
					cursor: item.disabled ? "default" : "pointer",
					opacity: item.disabled ? .5 : 1
				},
				children: [item.icon || null, item.label]
			}, "mi" + i))
		}) })]
	});
}
var CONFIRM_W = 264;
/**
* The popover half of ConfirmBtn, split into a component of its own so it
* MOUNTS when the popover opens. That is what makes the shared dialog contract
* usable here: `useDialogFocusTrap`'s focus effects key on MOUNT, and
* ConfirmBtn itself is a persistent component — a hook call up there would run
* the focus effect once at page load against a null container.
*
* The trap owns Escape, the boundary-Tab ring, and the IME latch that guards
* both, so this surface no longer spells its own (#5542). Two pieces stay with
* the host because they are the host's own semantics: WHERE the popover sits
* (portal + flip geometry) and WHAT dismissal means (`onCancel` returns focus
* to the trigger).
*/
function ConfirmPopover({ popRef, title, desc, confirmLabel, posStyle, openUp, onCancel, onConfirm }) {
	useDialogFocusTrap(popRef, onCancel, { restoreFocus: false });
	return /* @__PURE__ */ jsxs("div", {
		ref: popRef,
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title,
		"data-placement": openUp ? "up" : "down",
		style: {
			...posStyle,
			zIndex: 4e3,
			overflowY: "auto",
			background: "var(--card, #16161a)",
			border: "1px solid var(--border)",
			borderRadius: 10,
			padding: "10px 12px",
			width: CONFIRM_W,
			boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
			textAlign: "left"
		},
		children: [
			/* @__PURE__ */ jsx("div", {
				style: {
					fontSize: 12.5,
					fontWeight: 600,
					marginBottom: 4
				},
				children: title
			}),
			/* @__PURE__ */ jsx("div", {
				style: {
					fontSize: 11.5,
					color: "var(--muted)",
					lineHeight: 1.5,
					marginBottom: 9
				},
				children: desc
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					gap: 8,
					justifyContent: "flex-end"
				},
				children: [/* @__PURE__ */ jsx(Btn, {
					onClick: onCancel,
					children: i18nT("pages.devFleetPage.cancel")
				}), /* @__PURE__ */ jsx(Btn, {
					primary: true,
					onClick: onConfirm,
					children: confirmLabel || i18nT("pages.devFleetPage.start")
				})]
			})
		]
	});
}
function ConfirmBtn({ title, desc, confirmLabel, onConfirm, btn, children }) {
	const [open, setOpen] = useState(false);
	const [rect, setRect] = useState(null);
	const triggerRef = useRef(null);
	const popRef = useRef(null);
	const close = useCallback(() => {
		setOpen(false);
		triggerRef.current?.focus();
	}, []);
	useEffect(() => {
		if (!open) return;
		const onDown = (e) => {
			const t = e.target;
			if (!triggerRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
		};
		const onScrollOrResize = () => setOpen(false);
		document.addEventListener("mousedown", onDown);
		window.addEventListener("scroll", onScrollOrResize, true);
		window.addEventListener("resize", onScrollOrResize);
		return () => {
			document.removeEventListener("mousedown", onDown);
			window.removeEventListener("scroll", onScrollOrResize, true);
			window.removeEventListener("resize", onScrollOrResize);
		};
	}, [open]);
	const toggle = () => {
		if (!open && triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
		setOpen((o) => !o);
	};
	const spaceBelow = rect ? window.innerHeight - rect.bottom - MENU_GAP : 0;
	const spaceAbove = rect ? rect.top - MENU_GAP : 0;
	const openUp = !!rect && spaceBelow < 188 && spaceAbove > spaceBelow;
	const avail = Math.max(80, (openUp ? spaceAbove : spaceBelow) - MENU_MARGIN);
	const posStyle = rect ? {
		position: "fixed",
		right: Math.max(MENU_MARGIN, window.innerWidth - rect.right),
		...openUp ? { bottom: window.innerHeight - rect.top + MENU_GAP } : { top: rect.bottom + MENU_GAP },
		maxHeight: avail
	} : { position: "fixed" };
	return /* @__PURE__ */ jsxs("span", {
		style: { display: "inline-flex" },
		children: [/* @__PURE__ */ jsx(Btn, {
			ref: triggerRef,
			...btn || {},
			onClick: toggle,
			"aria-haspopup": "dialog",
			"aria-expanded": open,
			children
		}), open && rect && /* @__PURE__ */ jsx(OverlayPortal, { children: /* @__PURE__ */ jsx(ConfirmPopover, {
			popRef,
			title,
			desc,
			confirmLabel,
			posStyle,
			openUp,
			onCancel: close,
			onConfirm: () => {
				close();
				onConfirm();
			}
		}) })]
	});
}
// src/DevFleetPageRow.tsx
/**
* One worktree row's parts: its action buttons, the Pull+Build and provision
* steppers, the running pod's readout, the provision log panel and the
* expanded detail panel. The facade's `renderRow` lays them out.
*/
function ProvLogPre({ lines, streaming }) {
	const ref = useRef(null);
	useEffect(() => {
		if (streaming && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
	}, [lines, streaming]);
	return /* @__PURE__ */ jsx("pre", {
		ref,
		style: {
			margin: "2px 0 8px 32px",
			padding: "8px 10px",
			maxHeight: 180,
			overflow: "auto",
			fontSize: 11,
			lineHeight: 1.45,
			background: "var(--bg)",
			border: "1px solid var(--border)",
			borderRadius: 8,
			whiteSpace: "pre-wrap",
			wordBreak: "break-all",
			minWidth: 640
		},
		children: filterStepMarkers(lines).join("\n") || "(no output yet)"
	});
}
function iconLabel(icon, label) {
	return /* @__PURE__ */ jsxs("span", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			gap: 5
		},
		children: [icon, label]
	});
}
function PodReadout({ r }) {
	if (!r) return null;
	const parts = [];
	const chip = {
		fontVariantNumeric: "tabular-nums",
		fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
	};
	if (r.mem_current != null) {
		const label = r.mem_max != null ? fmtBytes(r.mem_current) + " / " + fmtBytes(r.mem_max) : fmtBytes(r.mem_current);
		parts.push(/* @__PURE__ */ jsx("span", {
			style: {
				...chip,
				color: memColor(r.mem_current, r.mem_max)
			},
			title: i18nT("pages.devFleetPage.pod_memory_of_ceiling"),
			children: label
		}, "mem"));
	}
	if (r.cpu_pct != null) parts.push(/* @__PURE__ */ jsx("span", {
		style: chip,
		title: i18nT("pages.devFleetPage.pod_cpu_usage"),
		children: fmtPercent(r.cpu_pct / 100, { maximumFractionDigits: 1 })
	}, "cpu"));
	if (r.tasks != null) parts.push(/* @__PURE__ */ jsx("span", {
		style: chip,
		title: i18nT("pages.devFleetPage.pod_task_count"),
		children: i18nT("pages.devFleetPage.pod_task_chip", {
			count: r.tasks,
			n: fmtNumber$1(r.tasks)
		})
	}, "tasks"));
	if (parts.length === 0) return null;
	return /* @__PURE__ */ jsx("span", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			gap: 8,
			fontSize: 11,
			color: "var(--muted)",
			flexShrink: 1,
			minWidth: 0,
			maxWidth: "min(340px, 45%)",
			overflow: "hidden",
			whiteSpace: "nowrap"
		},
		children: parts.map((p, i) => /* @__PURE__ */ jsxs("span", {
			style: {
				display: "inline-flex",
				alignItems: "center",
				gap: 8
			},
			children: [i > 0 ? /* @__PURE__ */ jsx("span", {
				style: { opacity: .4 },
				children: "·"
			}) : null, p]
		}, i))
	});
}
/** The PR state badge's word. Literal keys so the catalog gates see each one;
*  a state GitHub adds later still shows, lowercased, as it did before. */
var PR_STATE_LABEL = {
	OPEN: () => i18nT("pages.devFleetPage.pr_state_open"),
	MERGED: () => i18nT("pages.devFleetPage.pr_state_merged"),
	CLOSED: () => i18nT("pages.devFleetPage.pr_state_closed")
};
var prStateLabel = (state) => PR_STATE_LABEL[state ?? ""]?.() ?? (state || "").toLowerCase();
function DetailPanel({ w, d, busy, onRemove, onLoadLogs, logs, logsLoading }) {
	const mono = {
		fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
		fontSize: 11.5
	};
	const mutedSm = {
		fontSize: 11,
		color: "var(--muted)",
		lineHeight: 1.6
	};
	const [logsOpen, setLogsOpen] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: 6
		},
		children: [
			/* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [
					i18nT("pages.devFleetPage.branch"),
					" ",
					/* @__PURE__ */ jsx("span", {
						style: {
							...mono,
							color: "var(--text)"
						},
						children: d.branch || "?"
					})
				]
			}),
			d.pr ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [
					i18nT("pages.devFleetPage.pr"),
					" ",
					/* @__PURE__ */ jsxs("a", {
						href: d.pr.url || "#",
						target: "_blank",
						rel: "noopener noreferrer",
						title: d.pr.title || void 0,
						style: { color: "var(--accent)" },
						children: [
							"#",
							d.pr.number || "?",
							d.pr.title ? " — " + d.pr.title : ""
						]
					}),
					" ",
					/* @__PURE__ */ jsx(Badge, {
						variant: d.pr.state === "MERGED" ? "aim" : d.pr.state === "OPEN" ? "ok" : "warn",
						children: prStateLabel(d.pr.state)
					})
				]
			}) : null,
			d.summary ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [
					i18nT("pages.devFleetPage.purpose"),
					" ",
					/* @__PURE__ */ jsx("span", {
						style: { color: "var(--text)" },
						children: d.summary
					})
				]
			}) : null,
			d.issues?.length > 0 ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [
					i18nT("pages.devFleetPage.issues"),
					" ",
					d.issues.map((it, i) => it.url ? /* @__PURE__ */ jsxs("a", {
						href: it.url,
						target: "_blank",
						rel: "noopener noreferrer",
						style: {
							color: "var(--accent)",
							marginRight: 8
						},
						children: ["#", it.number]
					}, i) : /* @__PURE__ */ jsxs("span", {
						style: {
							color: "var(--text)",
							marginRight: 8
						},
						children: ["#", it.number]
					}, i))
				]
			}) : null,
			d.tickets?.length > 0 ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [
					i18nT("pages.devFleetPage.tickets"),
					" ",
					d.tickets.map((t, i) => t.url ? /* @__PURE__ */ jsx("a", {
						href: t.url,
						target: "_blank",
						rel: "noopener noreferrer",
						style: {
							color: "var(--accent)",
							marginRight: 8
						},
						children: t.id
					}, i) : /* @__PURE__ */ jsx("span", {
						style: {
							color: "var(--text)",
							marginRight: 8
						},
						children: t.id
					}, i))
				]
			}) : null,
			d.design_docs?.length > 0 ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [/* @__PURE__ */ jsxs("span", {
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: 4
					},
					children: [
						/* @__PURE__ */ jsx(FileText, {
							size: 11,
							className: "lucide-inline"
						}),
						" ",
						i18nT("pages.devFleetPage.design_docs")
					]
				}), /* @__PURE__ */ jsx("ul", {
					style: {
						margin: "2px 0 0 16px",
						padding: 0,
						listStyle: "none"
					},
					children: d.design_docs.map((doc, i) => /* @__PURE__ */ jsx("li", {
						style: mono,
						children: doc
					}, i))
				})]
			}) : null,
			d.commits?.length > 0 ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [/* @__PURE__ */ jsxs("span", {
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: 4
					},
					children: [
						/* @__PURE__ */ jsx(GitCommit, {
							size: 11,
							className: "lucide-inline"
						}),
						" ",
						i18nT("pages.devFleetPage.commits")
					]
				}), /* @__PURE__ */ jsx("ul", {
					style: {
						margin: "2px 0 0 16px",
						padding: 0,
						listStyle: "none"
					},
					children: d.commits.map((c, i) => /* @__PURE__ */ jsxs("li", {
						style: {
							...mono,
							display: "flex",
							gap: 8
						},
						children: [
							/* @__PURE__ */ jsx("span", {
								style: {
									color: "var(--accent)",
									flexShrink: 0
								},
								children: c.hash
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									flex: 1,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap"
								},
								children: c.subject
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									color: "var(--muted)",
									flexShrink: 0
								},
								children: c.when
							})
						]
					}, i))
				})]
			}) : null,
			d.disk_mb != null ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [
					i18nT("pages.devFleetPage.disk"),
					" ",
					fmtUnit(d.disk_mb, "megabyte", { maximumFractionDigits: 0 })
				]
			}) : null,
			d.pod_running ? /* @__PURE__ */ jsxs("div", {
				style: mutedSm,
				children: [i18nT("pages.devFleetPage.pod_running_on"), d.pod_port || "?"]
			}) : null,
			w.pod_resources ? /* @__PURE__ */ jsxs("div", {
				style: {
					...mutedSm,
					display: "flex",
					flexDirection: "column",
					gap: 2
				},
				children: [
					w.pod_resources.mem_current != null ? /* @__PURE__ */ jsx("div", {
						style: {
							...mono,
							color: memColor(w.pod_resources.mem_current, w.pod_resources.mem_max)
						},
						children: i18nT("pages.devFleetPage.pod_memory", { value: w.pod_resources.mem_max != null ? fmtBytes(w.pod_resources.mem_current) + " / " + fmtBytes(w.pod_resources.mem_max) : fmtBytes(w.pod_resources.mem_current) })
					}) : null,
					w.pod_resources.cpu_pct != null ? /* @__PURE__ */ jsx("div", {
						style: {
							...mono,
							color: "var(--text)"
						},
						children: i18nT("pages.devFleetPage.pod_cpu", { value: fmtPercent(w.pod_resources.cpu_pct / 100, { maximumFractionDigits: 1 }) })
					}) : null,
					w.pod_resources.tasks != null ? /* @__PURE__ */ jsx("div", {
						style: {
							...mono,
							color: "var(--text)"
						},
						children: i18nT("pages.devFleetPage.pod_tasks", { value: w.pod_resources.tasks })
					}) : null,
					w.pod_resources.home_bytes != null ? /* @__PURE__ */ jsx("div", {
						style: {
							...mono,
							color: "var(--text)"
						},
						children: i18nT("pages.devFleetPage.pod_home_size", { value: fmtBytes(w.pod_resources.home_bytes) })
					}) : null
				]
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					gap: 8,
					marginTop: 4
				},
				children: [d.pod_running ? /* @__PURE__ */ jsx(Btn, {
					onClick: () => {
						if (!logsOpen) {
							setLogsOpen(true);
							onLoadLogs();
						} else setLogsOpen(false);
					},
					disabled: !!logsLoading,
					children: iconLabel(/* @__PURE__ */ jsx(FileText, {
						size: 12,
						className: "lucide-inline"
					}), logsLoading ? i18nT("pages.devFleetPage.loading") : logsOpen ? i18nT("pages.devFleetPage.hide_logs") : i18nT("pages.devFleetPage.load_pod_logs"))
				}) : null, !w.is_main ? /* @__PURE__ */ jsx(Btn, {
					danger: true,
					onClick: onRemove,
					disabled: !!busy[w.name + ":remove"],
					children: iconLabel(/* @__PURE__ */ jsx(Trash2, {
						size: 13,
						className: "lucide-inline"
					}), i18nT("pages.devFleetPage.remove"))
				}) : null]
			}),
			logsOpen && logs ? /* @__PURE__ */ jsx("pre", {
				style: {
					margin: "4px 0 0",
					padding: "8px 10px",
					maxHeight: 200,
					overflow: "auto",
					fontSize: 11,
					lineHeight: 1.45,
					background: "var(--bg)",
					border: "1px solid var(--border)",
					borderRadius: 8,
					whiteSpace: "pre-wrap",
					wordBreak: "break-all"
				},
				children: logs
			}) : null
		]
	});
}
/** A worktree row's action buttons, its row menu and the rebase result chip. */
function DevFleetRowActions({ w, fleet, busy, rebaseResult, syncRun, gatewayMutating, liveStateUnknown, stagedWorktree, liveWorktree, dismissRebaseResult, act, launchQa, provision, syncMain, rebaseWorktree, restartGateway, makeLive, podsAvailable }) {
	if (w.is_main) {
		const out = [/* @__PURE__ */ jsx(ConfirmBtn, {
			title: i18nT("pages.devFleetPage.pull_build_main"),
			desc: fleet?.gateway_service_active ? i18nT("pages.devFleetPage.pulls_main_rebuilds_then_restarts_keep_page_open") : i18nT("pages.devFleetPage.pulls_main_and_rebuilds_6_min_does_not_restart"),
			confirmLabel: i18nT("pages.devFleetPage.start"),
			onConfirm: () => syncMain(),
			btn: { disabled: !!busy["__syncmain"] || syncRun?.status === "running" || gatewayMutating },
			children: iconLabel(/* @__PURE__ */ jsx(RefreshCw, {
				size: 13,
				className: "lucide-inline"
			}), busy["__syncmain"] || syncRun?.status === "running" ? i18nT("pages.devFleetPage.building") : i18nT("pages.devFleetPage.pull_build_2"))
		}, "sync")];
		const showRestart = !!fleet?.gateway_service_active;
		const showCancel = !!w.is_live && !!stagedWorktree;
		if (showRestart && showCancel) out.push(/* @__PURE__ */ jsx(MenuBtn, { items: [{
			label: i18nT("pages.devFleetPage.restart"),
			icon: /* @__PURE__ */ jsx(RotateCw, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => restartGateway(),
			disabled: gatewayMutating
		}, {
			label: i18nT("pages.devFleetPage.cancel_staged_cutover"),
			icon: /* @__PURE__ */ jsx(X, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => makeLive(w),
			disabled: gatewayMutating,
			title: i18nT("pages.devFleetPage.keeps_this_checkout_the_live_target_and_discards", { staged: stagedWorktree?.name ?? "" })
		}] }, "gwmenu"));
		else {
			if (showRestart) out.push(/* @__PURE__ */ jsx(Btn, {
				onClick: () => restartGateway(),
				disabled: gatewayMutating,
				"aria-label": i18nT("pages.devFleetPage.restart_gateway"),
				children: iconLabel(/* @__PURE__ */ jsx(RotateCw, {
					size: 13,
					className: "lucide-inline"
				}), i18nT("pages.devFleetPage.restart"))
			}, "restart"));
			if (!w.is_live && !w.is_staged) out.push(/* @__PURE__ */ jsx(Btn, {
				onClick: () => makeLive(w),
				disabled: gatewayMutating || liveStateUnknown,
				title: liveStateUnknown ? i18nT("pages.devFleetPage.live_state_unknown") : i18nT("pages.devFleetPage.repoint_the_live_gateway_back_at_main_restarts_t"),
				"data-testid": liveStateUnknown ? "fleet-make-live-disabled-unknown" : void 0,
				children: iconLabel(/* @__PURE__ */ jsx(Rocket, {
					size: 13,
					className: "lucide-inline"
				}), i18nT("pages.devFleetPage.make_live"))
			}, "makelive"));
			if (showCancel) out.push(/* @__PURE__ */ jsx(Btn, {
				onClick: () => makeLive(w),
				disabled: gatewayMutating,
				title: i18nT("pages.devFleetPage.keeps_this_checkout_the_live_target_and_discards", { staged: stagedWorktree?.name ?? "" }),
				children: iconLabel(/* @__PURE__ */ jsx(X, {
					size: 13,
					className: "lucide-inline"
				}), i18nT("pages.devFleetPage.cancel_staged_cutover"))
			}, "cancelcutover"));
		}
		if (fleet?.build_pending) out.push(/* @__PURE__ */ jsx(Badge, {
			variant: "warn",
			title: i18nT("pages.devFleetPage.build_pending_restart_gateway_to_apply_kirocrew"),
			children: i18nT("pages.devFleetPage.build_pending")
		}, "bp"));
		return out;
	}
	const out = [];
	if (!w.has_dist) out.push(/* @__PURE__ */ jsx(Btn, {
		onClick: () => provision(w.name),
		children: i18nT("pages.devFleetPage.provision")
	}, "prov"));
	else if (w.running) out.push(/* @__PURE__ */ jsx(Btn, {
		onClick: () => act(w.name, "open"),
		children: iconLabel(/* @__PURE__ */ jsx(ExternalLink, {
			size: 13,
			className: "lucide-inline"
		}), i18nT("pages.devFleetPage.open"))
	}, "open"));
	if (busy[w.name + ":up"] || busy[w.name + ":down"] || busy[w.name + ":restart"]) out.push(/* @__PURE__ */ jsxs("span", {
		style: {
			display: "inline-flex",
			alignItems: "center",
			gap: 4,
			fontSize: 11,
			color: "var(--muted)"
		},
		children: [
			/* @__PURE__ */ jsx(LoaderCircle, {
				size: 12,
				className: "lucide-inline animate-spin"
			}),
			" ",
			i18nT("pages.devFleetPage.pod"),
			"…"
		]
	}, "podbusy"));
	out.push(/* @__PURE__ */ jsx(MenuBtn, { items: [
		podsAvailable && w.has_dist && !w.running ? {
			label: i18nT("pages.devFleetPage.spin_up_pod"),
			icon: /* @__PURE__ */ jsx(Play, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => act(w.name, "up")
		} : null,
		podsAvailable && w.running ? {
			label: i18nT("pages.devFleetPage.restart_pod"),
			icon: /* @__PURE__ */ jsx(RefreshCw, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => act(w.name, "restart")
		} : null,
		{
			label: i18nT("pages.devFleetPage.rebase_onto_main"),
			icon: /* @__PURE__ */ jsx(RefreshCw, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => rebaseWorktree(w.name),
			disabled: !!busy[w.name + ":rebase"]
		},
		!w.is_live && !w.is_staged ? {
			label: i18nT("pages.devFleetPage.make_live"),
			icon: /* @__PURE__ */ jsx(Rocket, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => makeLive(w),
			disabled: gatewayMutating || liveStateUnknown,
			title: liveStateUnknown ? i18nT("pages.devFleetPage.live_state_unknown") : i18nT("pages.devFleetPage.repoint_the_live_gateway_at_this_worktree_restar")
		} : null,
		w.is_live && stagedWorktree ? {
			label: i18nT("pages.devFleetPage.cancel_staged_cutover"),
			icon: /* @__PURE__ */ jsx(X, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => makeLive(w),
			disabled: gatewayMutating,
			title: i18nT("pages.devFleetPage.keeps_this_checkout_the_live_target_and_discards", { staged: stagedWorktree.name })
		} : null,
		!w.is_live && stagedWorktree?.name === w.name && liveWorktree ? {
			label: i18nT("pages.devFleetPage.cancel_staged_cutover"),
			icon: /* @__PURE__ */ jsx(X, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => makeLive(liveWorktree),
			disabled: gatewayMutating,
			title: i18nT("pages.devFleetPage.keeps_the_live_checkout_the_live_target_and_disc", { staged: stagedWorktree.name })
		} : null,
		podsAvailable ? {
			label: i18nT("pages.devFleetPage.qa_video"),
			icon: /* @__PURE__ */ jsx(Video, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => launchQa(w.name)
		} : null,
		podsAvailable && w.running ? {
			label: i18nT("pages.devFleetPage.stop_pod"),
			icon: /* @__PURE__ */ jsx(Square, {
				size: 13,
				className: "lucide-inline"
			}),
			onClick: () => act(w.name, "down"),
			danger: true
		} : null
	] }, "menu"));
	const rr = rebaseResult[w.name];
	if (rr?.kind === "ok") out.push(/* @__PURE__ */ jsx(Clickable, {
		"aria-label": i18nT("pages.devFleetPage.dismiss"),
		onClick: () => dismissRebaseResult(w.name),
		style: {
			fontSize: 11,
			color: "var(--ok)",
			cursor: "pointer",
			maxWidth: 200,
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap",
			background: "none",
			border: "none",
			padding: 0
		},
		children: rr.text
	}, "rr"));
	return out;
}
/** The main row's Pull+Build stepper: running, done or failed. */
function DevFleetSyncStepper({ syncRun, syncLogOpen, setSyncLogOpen, dismissSync }) {
	if (!syncRun) return null;
	const mono = {
		fontFamily: "ui-monospace, monospace",
		fontVariantNumeric: "tabular-nums",
		fontSize: 11,
		color: "var(--muted)"
	};
	if (syncRun.status === "running") return /* @__PURE__ */ jsxs("div", {
		style: {
			gridColumn: "4 / -1",
			display: "flex",
			alignItems: "center",
			gap: 10,
			minWidth: 0
		},
		children: [
			/* @__PURE__ */ jsx(LoaderCircle, {
				role: "progressbar",
				"aria-label": i18nT("pages.devFleetPage.sync_progress"),
				className: "lucide-inline animate-spin",
				style: {
					color: "var(--accent)",
					flexShrink: 0
				}
			}),
			/* @__PURE__ */ jsx("span", {
				style: {
					fontSize: 11,
					fontWeight: 600,
					flexShrink: 0
				},
				children: i18nT("pages.devFleetPage.syncing")
			}),
			syncRun.stepLabel ? /* @__PURE__ */ jsx("span", {
				style: {
					...mono,
					flexShrink: 0
				},
				title: i18nT("pages.devFleetPage.current_step"),
				children: syncRun.stepLabel
			}) : null,
			/* @__PURE__ */ jsx("span", { style: {
				flex: 1,
				minWidth: 0
			} }),
			/* @__PURE__ */ jsx("span", {
				style: mono,
				children: fmtElapsed(Date.now() - syncRun.startedAt)
			}),
			/* @__PURE__ */ jsx(Clickable, {
				"aria-label": i18nT("pages.devFleetPage.toggle_log"),
				"aria-expanded": syncLogOpen,
				onClick: () => setSyncLogOpen((o) => !o),
				style: {
					background: "none",
					border: "none",
					color: "var(--muted)",
					cursor: "pointer",
					fontSize: 11,
					padding: 2
				},
				children: syncLogOpen ? i18nT("pages.devFleetPage.log") : i18nT("pages.devFleetPage.log_2")
			}),
			/* @__PURE__ */ jsx(Clickable, {
				"aria-label": i18nT("pages.devFleetPage.dismiss_sync_status"),
				onClick: () => dismissSync(syncRun?.rid),
				style: {
					background: "none",
					border: "none",
					color: "var(--muted)",
					cursor: "pointer",
					fontSize: 14,
					padding: 2
				},
				children: "×"
			})
		]
	});
	if (syncRun.status === "done") return /* @__PURE__ */ jsxs("div", {
		style: {
			gridColumn: "4 / -1",
			display: "flex",
			alignItems: "center",
			gap: 8,
			minWidth: 0
		},
		children: [
			/* @__PURE__ */ jsxs("span", {
				style: {
					fontSize: 12,
					fontWeight: 600,
					color: "var(--ok)",
					display: "inline-flex",
					alignItems: "center",
					gap: 4
				},
				children: [
					/* @__PURE__ */ jsx(Check, {
						size: 12,
						className: "lucide-inline"
					}),
					" ",
					i18nT("pages.devFleetPage.synced")
				]
			}),
			/* @__PURE__ */ jsx("span", {
				style: {
					fontSize: 11,
					color: "var(--muted)"
				},
				children: i18nT("pages.devFleetPage.restart_gateway_to_apply_the_new_build")
			}),
			/* @__PURE__ */ jsx("span", { style: { flex: 1 } }),
			/* @__PURE__ */ jsx(Clickable, {
				"aria-label": i18nT("pages.devFleetPage.toggle_log"),
				"aria-expanded": syncLogOpen,
				onClick: () => setSyncLogOpen((o) => !o),
				style: {
					background: "none",
					border: "none",
					color: "var(--muted)",
					cursor: "pointer",
					fontSize: 11,
					padding: 2
				},
				children: syncLogOpen ? i18nT("pages.devFleetPage.log") : i18nT("pages.devFleetPage.log_2")
			}),
			/* @__PURE__ */ jsx(Clickable, {
				"aria-label": i18nT("pages.devFleetPage.dismiss_sync_status"),
				onClick: () => dismissSync(syncRun?.rid),
				style: {
					background: "none",
					border: "none",
					color: "var(--muted)",
					cursor: "pointer",
					fontSize: 14,
					padding: 2
				},
				children: "×"
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		style: {
			gridColumn: "4 / -1",
			display: "flex",
			flexWrap: "wrap",
			alignItems: "center",
			justifyContent: "flex-end",
			gap: 8,
			minWidth: 0
		},
		children: [
			/* @__PURE__ */ jsx(ErrorNotice, {
				title: i18nT("pages.devFleetPage.pull_build_failed"),
				message: syncRun.last,
				messageClassName: "whitespace-pre-wrap",
				variant: "inline",
				askAgent: true,
				className: "basis-full min-w-0 flex-wrap select-text",
				testId: "sync-error"
			}),
			/* @__PURE__ */ jsx(Clickable, {
				"aria-label": i18nT("pages.devFleetPage.toggle_log"),
				"aria-expanded": syncLogOpen,
				onClick: () => setSyncLogOpen((o) => !o),
				style: {
					background: "none",
					border: "none",
					color: "var(--muted)",
					cursor: "pointer",
					fontSize: 11,
					padding: 2
				},
				children: syncLogOpen ? i18nT("pages.devFleetPage.log") : i18nT("pages.devFleetPage.log_2")
			}),
			/* @__PURE__ */ jsx(Clickable, {
				"aria-label": i18nT("pages.devFleetPage.dismiss_sync_status"),
				onClick: () => dismissSync(syncRun?.rid),
				style: {
					background: "none",
					border: "none",
					color: "var(--muted)",
					cursor: "pointer",
					fontSize: 14,
					padding: 2
				},
				children: "×"
			})
		]
	});
}
/** A worktree row's provision stepper: starting, running, done or failed. */
function DevFleetProvStepper({ w, prov, provLogOpen, dismissProv, toggleProvLog }) {
	const pr = prov[w.name];
	if (!pr) return null;
	const mono = {
		fontFamily: "ui-monospace, monospace",
		fontVariantNumeric: "tabular-nums",
		fontSize: 11,
		color: "var(--muted)"
	};
	const open = !!provLogOpen[w.name];
	const logToggle = /* @__PURE__ */ jsx(Clickable, {
		"aria-label": i18nT("pages.devFleetPage.toggle_provision_log"),
		"aria-expanded": open,
		onClick: () => toggleProvLog(w.name),
		style: {
			background: "none",
			border: "none",
			color: "var(--muted)",
			cursor: "pointer",
			fontSize: 11,
			padding: 2
		},
		children: open ? i18nT("pages.devFleetPage.log") : i18nT("pages.devFleetPage.log_2")
	});
	if (pr.failed) return /* @__PURE__ */ jsxs("div", {
		style: {
			gridColumn: "4 / -1",
			display: "flex",
			flexWrap: "wrap",
			alignItems: "center",
			justifyContent: "flex-end",
			gap: 8,
			minWidth: 0
		},
		children: [/* @__PURE__ */ jsx(ErrorNotice, {
			title: pr.exit != null ? i18nT("pages.devFleetPage.provision_failed_exit_code", { code: pr.exit }) : i18nT("pages.devFleetPage.provision_failed"),
			message: syncFailureTail(pr.lines) || i18nT("pages.devFleetPage.provision_failed"),
			messageClassName: "whitespace-pre-wrap",
			variant: "inline",
			askAgent: true,
			onDismiss: () => {
				dismissProv(w.name);
			},
			className: "basis-full min-w-0 flex-wrap",
			testId: `provision-error-${w.name}`
		}), logToggle]
	});
	if (pr.done) return /* @__PURE__ */ jsx("div", {
		style: {
			gridColumn: "4 / -1",
			display: "flex",
			alignItems: "center",
			gap: 8,
			minWidth: 0
		},
		children: /* @__PURE__ */ jsxs("span", {
			style: {
				fontSize: 12,
				fontWeight: 600,
				color: "var(--ok)",
				display: "inline-flex",
				alignItems: "center",
				gap: 4
			},
			children: [
				/* @__PURE__ */ jsx(Check, {
					size: 12,
					className: "lucide-inline"
				}),
				" ",
				i18nT("pages.devFleetPage.provisioned")
			]
		})
	});
	const phase = provPhase(pr.lines);
	const last = lastLine(pr.lines);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			gridColumn: "4 / -1",
			display: "flex",
			alignItems: "center",
			gap: 10,
			minWidth: 0
		},
		children: [
			/* @__PURE__ */ jsx(LoaderCircle, {
				size: 12,
				className: "lucide-inline animate-spin",
				style: {
					color: "var(--accent)",
					flexShrink: 0
				}
			}),
			/* @__PURE__ */ jsx("span", {
				style: {
					fontSize: 11,
					fontWeight: 600,
					flexShrink: 0
				},
				children: i18nT("pages.devFleetPage.provisioning")
			}),
			phase ? /* @__PURE__ */ jsx("span", {
				style: {
					fontSize: 10,
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
					color: "var(--accent)",
					background: "var(--accent-subtle, rgba(99,102,241,0.14))",
					borderRadius: 5,
					padding: "1px 6px",
					flexShrink: 0
				},
				children: phase
			}) : null,
			/* @__PURE__ */ jsx("span", {
				style: {
					...mono,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					flex: 1
				},
				title: last,
				children: last || i18nT("pages.devFleetPage.starting")
			}),
			/* @__PURE__ */ jsx("span", {
				style: mono,
				children: fmtElapsed(Date.now() - pr.startedAt)
			}),
			logToggle
		]
	});
}
// src/DevFleetPagePrune.tsx
/** The Prune merged review: removable candidates, closed-PR candidates and the kept worktrees an override may force. */
function DevFleetPruneReview({ fleet, pruneDialog, setPruneDialog, pruneSelected, setPruneSelected, pruneForceSelected, setPruneForceSelected, askConfirm, pruneExecute }) {
	const liveWt = fleet?.worktrees?.find((w) => w.is_live);
	const isGuarded = (name) => {
		const wt = fleet?.worktrees?.find((w) => w.name === name);
		return !!(wt?.is_main || wt?.is_live || wt?.is_staged || liveWt && liveWt.name === name);
	};
	const hasForceSelected = pruneForceSelected.size > 0;
	const scratchPaths = (name) => {
		const k = pruneDialog.kept.find((r) => r.name === name);
		if (!k || k.dirty_tracked !== false) return null;
		const paths = k.dirty_untracked_paths ?? [];
		if (!paths.length || paths.length !== k.dirty_untracked) return null;
		return paths;
	};
	const untrackedOnly = (name) => scratchPaths(name) !== null;
	const handleRemove = async () => {
		const regularNames = pruneDialog.candidates.filter((c) => pruneSelected.has(c.name)).map((c) => c.name);
		const forceNames = Array.from(pruneForceSelected);
		const discardPaths = {};
		for (const n of forceNames) {
			const p = scratchPaths(n);
			if (p) discardPaths[n] = p;
		}
		if (forceNames.length > 0) {
			if (!await askConfirm(i18nT("pages.devFleetPage.force_remove_confirm_title"), i18nT("pages.devFleetPage.force_remove_confirm_desc", { count: forceNames.length }), {
				confirmLabel: i18nT("pages.devFleetPage.delete_anyway"),
				danger: true
			})) return;
		}
		pruneExecute(regularNames, forceNames, discardPaths);
	};
	return /* @__PURE__ */ jsx(Modal, {
		open: true,
		onClose: () => setPruneDialog(null),
		title: i18nT("pages.devFleetPage.prune_worktrees"),
		maxWidth: 480,
		footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
			onClick: () => setPruneDialog(null),
			children: i18nT("pages.devFleetPage.cancel")
		}), /* @__PURE__ */ jsx(Btn, {
			danger: true,
			onClick: handleRemove,
			children: i18nT("pages.devFleetPage.remove_selected")
		})] }),
		children: /* @__PURE__ */ jsxs("div", {
			style: {
				maxHeight: 360,
				overflowY: "auto"
			},
			children: [
				pruneDialog.candidates.filter((c) => c.code !== "closed").length > 0 && /* @__PURE__ */ jsxs("div", {
					style: { marginBottom: 10 },
					children: [/* @__PURE__ */ jsx("div", {
						style: {
							fontSize: 10,
							letterSpacing: "0.08em",
							color: "var(--muted)",
							textTransform: "uppercase",
							borderBottom: "1px solid var(--border)",
							paddingBottom: 3,
							marginBottom: 4
						},
						children: i18nT("pages.devFleetPage.remove")
					}), pruneDialog.candidates.filter((c) => c.code !== "closed").map((c) => /* @__PURE__ */ jsxs("label", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8,
							padding: "4px 0",
							cursor: "pointer"
						},
						children: [
							/* @__PURE__ */ jsx(Checkbox, {
								checked: pruneSelected.has(c.name),
								onChange: (e) => setPruneSelected((prev) => {
									const next = new Set(prev);
									if (e.target.checked) next.add(c.name);
									else next.delete(c.name);
									return next;
								}),
								"aria-label": i18nT("pages.devFleetPage.select", { name: c.name })
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
									fontSize: 12,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									flex: "1 1 auto",
									minWidth: 0
								},
								children: c.name
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									marginLeft: "auto",
									fontSize: 11,
									color: "var(--muted)",
									whiteSpace: "nowrap",
									flex: "0 1 auto",
									minWidth: 0,
									maxWidth: "min(200px, 55%)",
									overflow: "hidden",
									textOverflow: "ellipsis"
								},
								children: pruneVerdictLabel(c.code)
							})
						]
					}, c.name))]
				}),
				pruneDialog.candidates.filter((c) => c.code === "closed").length > 0 && /* @__PURE__ */ jsxs("div", {
					style: { marginBottom: 10 },
					children: [
						/* @__PURE__ */ jsx("div", {
							style: {
								fontSize: 10,
								letterSpacing: "0.08em",
								color: "var(--warn)",
								textTransform: "uppercase",
								borderBottom: "1px solid var(--border)",
								paddingBottom: 3,
								marginBottom: 4
							},
							children: i18nT("pages.devFleetPage.remove_closed_pr")
						}),
						/* @__PURE__ */ jsx("p", {
							style: {
								fontSize: 11,
								color: "var(--muted)",
								margin: "0 0 6px"
							},
							children: i18nT("pages.devFleetPage.closed_pr_not_on_main_hint")
						}),
						pruneDialog.candidates.filter((c) => c.code === "closed").map((c) => /* @__PURE__ */ jsxs("label", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 8,
								padding: "4px 0",
								cursor: "pointer"
							},
							children: [
								/* @__PURE__ */ jsx(Checkbox, {
									checked: pruneSelected.has(c.name),
									onChange: (e) => setPruneSelected((prev) => {
										const next = new Set(prev);
										if (e.target.checked) next.add(c.name);
										else next.delete(c.name);
										return next;
									}),
									"aria-label": i18nT("pages.devFleetPage.select", { name: c.name })
								}),
								/* @__PURE__ */ jsx("span", {
									style: {
										fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
										fontSize: 12,
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										flex: "1 1 auto",
										minWidth: 0
									},
									children: c.name
								}),
								/* @__PURE__ */ jsx("span", {
									style: {
										marginLeft: "auto",
										fontSize: 11,
										color: c.unmerged_commits ? "var(--danger)" : "var(--muted)",
										whiteSpace: "nowrap",
										flex: "0 1 auto",
										minWidth: 0,
										maxWidth: "min(200px, 55%)",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: c.unmerged_commits ? i18nT("pages.devFleetPage.closed_has_unmerged_commits") : pruneVerdictLabel(c.code)
								})
							]
						}, c.name))
					]
				}),
				pruneDialog.kept.length > 0 && /* @__PURE__ */ jsxs("div", {
					style: { marginBottom: 10 },
					children: [
						/* @__PURE__ */ jsx("div", {
							style: {
								fontSize: 10,
								letterSpacing: "0.08em",
								color: "var(--muted)",
								textTransform: "uppercase",
								borderBottom: "1px solid var(--border)",
								paddingBottom: 3,
								marginBottom: 4
							},
							children: i18nT("pages.devFleetPage.kept")
						}),
						pruneDialog.kept.some((k) => !isGuarded(k.name) && !k.dirty && k.code !== "dirty_check_failed") && /* @__PURE__ */ jsx("p", {
							style: {
								fontSize: 11,
								color: "var(--muted)",
								margin: "0 0 6px"
							},
							children: i18nT("pages.devFleetPage.kept_force_hint")
						}),
						pruneDialog.kept.some((k) => !isGuarded(k.name) && untrackedOnly(k.name)) && /* @__PURE__ */ jsx("p", {
							style: {
								fontSize: 11,
								color: "var(--muted)",
								margin: "0 0 6px"
							},
							children: i18nT("pages.devFleetPage.kept_discard_untracked_hint")
						}),
						pruneDialog.kept.map((k) => {
							const guarded = isGuarded(k.name);
							const scratchOnly = untrackedOnly(k.name);
							const cannotForce = k.code === "dirty_check_failed" || !!k.dirty && !scratchOnly;
							const disabled = guarded || cannotForce;
							const checked = pruneForceSelected.has(k.name);
							return /* @__PURE__ */ jsxs("label", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: 8,
									padding: "4px 0",
									cursor: disabled ? "default" : "pointer",
									opacity: disabled ? .6 : 1
								},
								children: [
									guarded ? /* @__PURE__ */ jsx("span", {
										style: {
											width: 13,
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center"
										},
										children: /* @__PURE__ */ jsx(ShieldAlert, {
											size: 13,
											style: { color: "var(--muted)" }
										})
									}) : /* @__PURE__ */ jsx(Checkbox, {
										checked,
										disabled: cannotForce,
										onChange: (e) => setPruneForceSelected((prev) => {
											const next = new Set(prev);
											if (e.target.checked) next.add(k.name);
											else next.delete(k.name);
											return next;
										}),
										"aria-label": i18nT("pages.devFleetPage.force_remove", { name: k.name })
									}),
									/* @__PURE__ */ jsx("span", {
										style: {
											fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
											fontSize: 12,
											color: checked ? "var(--danger)" : guarded ? "var(--muted)" : "var(--text)",
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											flex: "1 1 auto",
											minWidth: 0
										},
										children: k.name
									}),
									/* @__PURE__ */ jsxs("span", {
										style: {
											marginLeft: "auto",
											fontSize: 11,
											color: "var(--muted)",
											whiteSpace: "nowrap",
											flex: "0 1 auto",
											minWidth: 0,
											overflow: "hidden",
											textOverflow: "ellipsis",
											maxWidth: "min(200px, 55%)"
										},
										title: scratchOnly ? (k.dirty_untracked_paths ?? []).join(", ") : pruneVerdictLabel(k.code),
										children: [guarded && i18nT("pages.devFleetPage.protected_worktree"), !guarded && (scratchOnly ? (k.dirty_untracked_paths ?? []).join(", ") : pruneVerdictLabel(k.code))]
									})
								]
							}, k.name);
						}),
						hasForceSelected && /* @__PURE__ */ jsx("p", {
							style: {
								fontSize: 11,
								color: "var(--danger)",
								margin: "6px 0 0"
							},
							children: i18nT("pages.devFleetPage.force_remove_warning")
						})
					]
				}),
				pruneDialog.candidates.length === 0 && !pruneDialog.kept.length && /* @__PURE__ */ jsx("p", {
					style: {
						fontSize: 12,
						color: "var(--muted)"
					},
					children: i18nT("pages.devFleetPage.no_candidates_found")
				}),
				/* @__PURE__ */ jsx("p", {
					style: {
						fontSize: 11,
						color: "var(--muted)",
						margin: "8px 0 0"
					},
					children: i18nT("pages.devFleetPage.removes_worktrees_and_stops_pods_cannot_be_undon")
				})
			]
		})
	});
}
/** The prune progress checklist, one row per selected worktree. */
function DevFleetPruneProgress({ pruneProgress, setPruneProgress }) {
	const pruneDone = pruneProgress != null && !pruneProgress.running;
	return /* @__PURE__ */ jsx(Modal, {
		open: true,
		onClose: () => {
			if (pruneDone) setPruneProgress(null);
		},
		title: pruneDone ? i18nT("pages.devFleetPage.prune_complete") : i18nT("pages.devFleetPage.pruning_worktrees"),
		maxWidth: 460,
		footer: pruneDone ? /* @__PURE__ */ jsx(Btn, {
			onClick: () => setPruneProgress(null),
			children: i18nT("pages.devFleetPage.close")
		}) : void 0,
		children: /* @__PURE__ */ jsxs("div", {
			style: { fontSize: 12 },
			children: [/* @__PURE__ */ jsxs("div", {
				style: {
					fontWeight: 600,
					marginBottom: 8
				},
				children: [
					pruneDone ? i18nT("pages.devFleetPage.finished") : i18nT("pages.devFleetPage.removing"),
					" ",
					pruneProgress.done,
					"/",
					pruneProgress.total
				]
			}), /* @__PURE__ */ jsx("div", {
				role: "list",
				style: {
					display: "flex",
					flexDirection: "column",
					maxHeight: 320,
					overflowY: "auto"
				},
				children: pruneProgress.names.map((nm) => {
					const it = pruneProgress.items[nm] || {
						status: "pending",
						error: null
					};
					const meta = PRUNE_STATUS_META[it.status] || PRUNE_STATUS_META.pending;
					return /* @__PURE__ */ jsxs("div", {
						role: "listitem",
						"data-testid": `prune-item-${nm}`,
						"data-status": it.status,
						style: {
							display: "flex",
							alignItems: "center",
							gap: 8,
							padding: "3px 0",
							borderBottom: "1px solid var(--border)"
						},
						children: [
							/* @__PURE__ */ jsx("span", {
								style: {
									width: 14,
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0
								},
								children: meta.kind === "spin" ? /* @__PURE__ */ jsx(LoaderCircle, {
									size: 12,
									className: "lucide-inline animate-spin",
									style: { color: "var(--muted)" }
								}) : meta.kind === "done" ? /* @__PURE__ */ jsx(Check, {
									size: 13,
									style: { color: "var(--ok)" }
								}) : meta.kind === "failed" ? /* @__PURE__ */ jsx(X, {
									size: 13,
									style: { color: "var(--danger)" }
								}) : /* @__PURE__ */ jsx("span", { style: {
									width: 6,
									height: 6,
									borderRadius: "50%",
									background: "var(--muted)",
									opacity: .4
								} })
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
									fontSize: 12,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									flexShrink: 0,
									maxWidth: 200
								},
								children: nm
							}),
							/* @__PURE__ */ jsxs("span", {
								style: {
									marginLeft: "auto",
									display: "inline-flex",
									alignItems: "center",
									gap: 6,
									minWidth: 0,
									paddingLeft: 8
								},
								children: [it.status === "failed" && it.error && /* @__PURE__ */ jsx(ErrorNotice, {
									message: it.error,
									variant: "inline",
									askAgent: true,
									className: "min-w-0",
									testId: `prune-item-error-${nm}`
								}), /* @__PURE__ */ jsx(Badge, {
									variant: meta.kind === "done" ? "ok" : meta.kind === "failed" ? "err" : "muted",
									className: "text-[10.5px] px-1.5 py-0",
									children: pruneStatusLabel(it.status)
								})]
							})
						]
					}, nm);
				})
			})]
		})
	});
}
// src/DevFleetPageNotices.tsx
/** The notices between the page header and the worktree table. */
function DevFleetPageNotices({ fleet, diskFailed, diskError, actionError, actionErrorRef, dismissActionError, gatewayError, setGatewayError, setDismissedUndoKey, gatewayMutating, makeLive, wts, running, needsProv, undoTarget, undoCurrent, undoKey, showUndoBanner, podsAvailable, podsReason, gatewayReason, servingReason, noFleet, diskGb }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		!noFleet && /* @__PURE__ */ jsxs("p", {
			className: "text-[12.5px] text-muted leading-relaxed mt-3 mb-1",
			children: [
				i18nT("pages.devFleetPage.each_row_below_is_a_git_worktree_discovered_from"),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "text-text-strong",
					children: i18nT("pages.devFleetPage.pull_build")
				}),
				" ",
				i18nT("pages.devFleetPage.on_the_main_row_to_fast_forward_it_from_origin_a"),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "text-text-strong",
					children: i18nT("pages.devFleetPage.pod_2")
				}),
				" ",
				i18nT("pages.devFleetPage.boots_any_worktree_as_an_isolated_throwaway_gate"),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "text-text-strong",
					children: i18nT("pages.devFleetPage.rebase")
				}),
				" ",
				i18nT("pages.devFleetPage.moves_a_feature_branch_onto_the_latest_main_and"),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "text-text-strong",
					children: i18nT("pages.devFleetPage.prune")
				}),
				" ",
				i18nT("pages.devFleetPage.safely_removes_worktrees_whose_pr_has_already_me")
			]
		}),
		!noFleet && fleet?.fleet_totals && (fleet.fleet_totals.pod_home_bytes != null || fleet.fleet_totals.orphan_pods != null && fleet.fleet_totals.orphan_pods > 0) ? /* @__PURE__ */ jsxs("div", {
			"data-testid": "fleet-totals",
			className: "flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12px] leading-relaxed text-muted",
			style: { fontVariantNumeric: "tabular-nums" },
			children: [fleet.fleet_totals.pod_home_bytes != null ? /* @__PURE__ */ jsxs("span", {
				title: i18nT("pages.devFleetPage.total_disk_used_by_running_pod_homes"),
				children: [
					/* @__PURE__ */ jsx(Server, {
						size: 12,
						className: "lucide-inline"
					}),
					" ",
					/* @__PURE__ */ jsx("span", {
						className: "text-text-strong",
						children: i18nT("pages.devFleetPage.pod_home_disk", { value: fmtBytes(fleet.fleet_totals.pod_home_bytes) })
					})
				]
			}) : null, fleet.fleet_totals.orphan_pods != null && fleet.fleet_totals.orphan_pods > 0 ? /* @__PURE__ */ jsxs("span", {
				title: i18nT("pages.devFleetPage.pod_homes_left_on_disk_with_no_live_pod"),
				style: { color: "var(--warn)" },
				children: [
					/* @__PURE__ */ jsx(AlertTriangle, {
						size: 12,
						className: "lucide-inline"
					}),
					" ",
					i18nT("pages.devFleetPage.orphan_pods_label", { value: fleet.fleet_totals.orphan_pods })
				]
			}) : null]
		}) : null,
		!noFleet && fleet?.main_repo_inferred && fleet.main_repo && /* @__PURE__ */ jsxs("div", {
			role: "note",
			"data-testid": "inferred-main-checkout",
			className: "flex items-center gap-2 mt-2 text-[12px] leading-relaxed text-text-strong",
			children: [
				/* @__PURE__ */ jsx(Info, {
					size: 13,
					className: "lucide-inline shrink-0"
				}),
				/* @__PURE__ */ jsxs("span", { children: [i18nT("pages.devFleetPage.the_primary_checkout_this_fleet_is_discovered_fr"), ":"] }),
				/* @__PURE__ */ jsx("code", {
					className: "min-w-0 break-all rounded bg-bg-elevated px-1.5 py-0.5 text-text-strong select-text",
					children: fleet.main_repo
				})
			]
		}),
		showUndoBanner && undoTarget && undoCurrent && /* @__PURE__ */ jsxs("div", {
			role: "status",
			"aria-live": "polite",
			"data-testid": "make-live-undo-banner",
			className: "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-md border border-ok/40 bg-ok-subtle px-3 py-2.5 mt-3 text-[12.5px] leading-relaxed text-text-strong",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 flex-1 items-center gap-2",
				children: [/* @__PURE__ */ jsx(Undo2, {
					className: "lucide-inline h-4 w-4 shrink-0 text-ok",
					"aria-hidden": true
				}), /* @__PURE__ */ jsx("span", {
					className: "min-w-0 break-words",
					children: i18nT("pages.devFleetPage.live_checkout_changed_to_name", { name: undoCurrent.name })
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 self-end sm:self-auto",
				children: [/* @__PURE__ */ jsx(Btn, {
					onClick: () => makeLive(undoTarget, { undo: true }),
					disabled: gatewayMutating,
					className: "border-border-strong bg-bg-elevated",
					children: iconLabel(/* @__PURE__ */ jsx(Undo2, {
						className: "lucide-inline h-3.5 w-3.5",
						"aria-hidden": true
					}), i18nT("pages.devFleetPage.undo_to_name", { name: undoTarget.name }))
				}), /* @__PURE__ */ jsx(Clickable, {
					"aria-label": i18nT("pages.devFleetPage.dismiss"),
					onClick: () => {
						setDismissedUndoKey(undoKey);
						persistDismissedUndoKey(undoKey);
					},
					className: "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-bg-hover hover:text-text",
					children: /* @__PURE__ */ jsx(X, {
						className: "lucide-inline h-4 w-4",
						"aria-hidden": true
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsx(ErrorNotice, {
			message: gatewayError,
			askAgent: true,
			onDismiss: () => setGatewayError(null),
			className: "mt-3 select-text",
			testId: "gateway-restart-error"
		}),
		/* @__PURE__ */ jsx("div", {
			ref: actionErrorRef,
			children: /* @__PURE__ */ jsx(ErrorNotice, {
				message: actionError && actionError !== gatewayError ? actionError : null,
				askAgent: true,
				onDismiss: dismissActionError,
				className: "mt-3 select-text",
				testId: "devfleet-action-error"
			})
		}),
		servingReason && /* @__PURE__ */ jsxs("div", {
			role: "alert",
			"data-testid": "serving-install-warning",
			className: "flex items-start gap-2 rounded-md border border-warn/40 bg-warn-subtle px-3 py-2.5 mt-3 text-[12.5px] leading-relaxed text-warn-text",
			children: [/* @__PURE__ */ jsx(AlertTriangle, {
				size: 14,
				className: "lucide-inline shrink-0 mt-0.5"
			}), /* @__PURE__ */ jsx("div", {
				className: "min-w-0",
				children: /* @__PURE__ */ jsx("span", {
					className: "break-words",
					children: servingReason
				})
			})]
		}),
		!podsAvailable && /* @__PURE__ */ jsxs("div", {
			role: "note",
			className: "flex items-start gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2.5 mt-3 text-[12.5px] leading-relaxed",
			children: [/* @__PURE__ */ jsx(Info, {
				size: 14,
				className: "lucide-inline shrink-0 mt-0.5 text-muted"
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-text-strong",
						children: i18nT("pages.devFleetPage.pods_are_unavailable_on_this_host")
					}),
					" ",
					podsReason ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
						className: "text-muted",
						children: podsReason
					}), " "] }) : null,
					/* @__PURE__ */ jsx("span", {
						className: "text-muted",
						children: i18nT("pages.devFleetPage.pod_and_make_live_actions_are_hidden_everything")
					})
				]
			})]
		}),
		gatewayReason && /* @__PURE__ */ jsxs("div", {
			role: "note",
			className: "flex items-start gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2.5 mt-3 text-[12.5px] leading-relaxed",
			children: [/* @__PURE__ */ jsx(Info, {
				size: 14,
				className: "lucide-inline shrink-0 mt-0.5 text-muted"
			}), /* @__PURE__ */ jsx("div", {
				className: "min-w-0",
				children: /* @__PURE__ */ jsx("span", {
					className: "text-muted",
					children: gatewayReason
				})
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 sm:grid-cols-4 gap-3 my-3.5",
			children: [
				/* @__PURE__ */ jsx(StatCard, {
					label: i18nT("pages.devFleetPage.running_pods"),
					value: noFleet ? "—" : running,
					accent: !noFleet
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: i18nT("pages.devFleetPage.worktrees"),
					value: noFleet ? "—" : wts.length
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: i18nT("pages.devFleetPage.needs_provision"),
					value: noFleet ? "—" : needsProv
				}),
				/* @__PURE__ */ jsx(StatCard, {
					label: i18nT("pages.devFleetPage.disk_worktrees"),
					value: noFleet || diskFailed ? "—" : diskGb
				})
			]
		}),
		!noFleet && diskFailed && /* @__PURE__ */ jsx(ErrorNotice, {
			title: i18nT("pages.devFleetPage.disk_usage_unavailable"),
			message: diskError instanceof Error ? diskError.message : String(diskError),
			variant: "inline",
			askAgent: true,
			className: "mb-3",
			testId: "disk-error"
		})
	] });
}
// src/DevFleetPage.tsx
/**
* Dev Fleet — worktree management page ported to the Kiro Crew SPA.
* Manages git worktrees, pod instances, syncing, pruning, and rebasing.
*
* This file is the page's import path. It keeps the page's state, effects and
* actions (their poll loops and toasts hold strings that are not translated,
* and the page assigns the notification bus's module state), that bus, the
* log-window merge and the relative-time label. The owners beside it take new
* work for their part: devFleetPageModel.ts (types and React-free logic),
* DevFleetPageMenus.tsx (row menus and confirms), DevFleetPageRow.tsx (a row's
* parts), DevFleetPagePrune.tsx (the prune dialogs) and DevFleetPageNotices.tsx
* (the notices above the table).
*/
var _hostNotify = null;
var _toastListeners = /* @__PURE__ */ new Set();
var _actionErrorListeners = /* @__PURE__ */ new Set();
var _lastActionError = null;
var _toastSeq = 1;
function notify(msg, opts) {
	const t = {
		id: _toastSeq++,
		msg,
		type: opts?.type || "info"
	};
	if (t.type === "error") {
		_lastActionError = msg;
		_actionErrorListeners.forEach((fn) => fn(msg));
	} else _toastListeners.forEach((fn) => fn(t));
	if (!_hostNotify) return;
	try {
		_hostNotify(msg, { type: opts?.type === "error" ? "error" : opts?.type === "success" ? "success" : "info" });
	} catch {}
}
var LOG_GAP_MARKER = "[… lines missed …]";
function mergeLogWindow(buffer, window) {
	if (!window.length) return buffer;
	if (!buffer.length) return window.slice();
	const max = Math.min(buffer.length, window.length);
	let overlap = 0;
	for (let k = max; k > 0; k--) {
		let match = true;
		for (let i = 0; i < k; i++) if (buffer[buffer.length - k + i] !== window[i]) {
			match = false;
			break;
		}
		if (match) {
			overlap = k;
			break;
		}
	}
	if (overlap === 0) return buffer.concat([LOG_GAP_MARKER], window);
	return buffer.concat(window.slice(overlap));
}
/** The UPDATED column's age, worded by the active locale. A timestamp ahead of
*  this clock reads "now", as it always has, rather than "in 5m". */
function relTime(epoch) {
	if (!epoch) return "";
	return fmtRelative(Math.min(epoch * 1e3, Date.now()));
}
function ToastHost() {
	const [toasts, setToasts] = useState([]);
	useEffect(() => {
		const on = (t) => {
			setToasts((ts) => [...ts, t]);
			window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 4e3);
		};
		_toastListeners.add(on);
		return () => {
			_toastListeners.delete(on);
		};
	}, []);
	if (!toasts.length) return null;
	return /* @__PURE__ */ jsx("div", {
		role: "status",
		"aria-live": "polite",
		className: "fixed top-safe-offset-3.5",
		style: {
			left: "50%",
			transform: "translateX(-50%)",
			zIndex: 9997,
			display: "flex",
			flexDirection: "column",
			gap: 6,
			alignItems: "center",
			pointerEvents: "none"
		},
		children: toasts.map((t) => /* @__PURE__ */ jsx("div", {
			style: {
				background: "var(--card)",
				color: "var(--card-fg)",
				border: "1px solid " + (t.type === "error" ? "var(--danger)" : t.type === "success" ? "var(--ok)" : "var(--border)"),
				borderRadius: 8,
				padding: "7px 14px",
				fontSize: 12.5,
				boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
				maxWidth: 520
			},
			children: t.msg
		}, t.id))
	});
}
function DevFleetPage() {
	_hostNotify = useNotify();
	const { openChat } = useChatLauncher();
	const queryClient = useQueryClient();
	const { data: fleet, isLoading: loading, error: fleetError } = useQuery({
		queryKey: ["dev-fleet", "fleet"],
		queryFn: () => get("/fleet"),
		refetchInterval: POLL_MS,
		refetchOnMount: "always"
	});
	const { data: disk, isError: diskFailed, error: diskError } = useQuery({
		queryKey: ["dev-fleet", "disk"],
		queryFn: () => get("/disk"),
		refetchInterval: 3e4
	});
	const { data: devFleetAppStatus, error: appStatusError } = useQuery({
		queryKey: ["dev-fleet", "app-backend-status"],
		queryFn: async () => {
			return await backendStatus();
		},
		enabled: !!fleetError,
		refetchInterval: POLL_MS,
		retry: false
	});
	const [actionError, setActionError] = useState(() => _lastActionError);
	const actionErrorRef = useRef(null);
	useEffect(() => {
		const on = (msg) => setActionError(msg);
		_actionErrorListeners.add(on);
		return () => {
			_actionErrorListeners.delete(on);
		};
	}, []);
	const dismissActionError = useCallback(() => {
		_lastActionError = null;
		setActionError(null);
	}, []);
	useEffect(() => {
		if (actionError) actionErrorRef.current?.scrollIntoView?.({
			block: "nearest",
			behavior: "smooth"
		});
	}, [actionError]);
	const refetchFleetFresh = useCallback(async () => {
		try {
			const data = await get("/fleet?fresh=1");
			if (data) queryClient.setQueryData(["dev-fleet", "fleet"], data);
			else queryClient.invalidateQueries({ queryKey: ["dev-fleet", "fleet"] });
		} catch {
			queryClient.invalidateQueries({ queryKey: ["dev-fleet", "fleet"] });
		}
	}, [queryClient]);
	const invalidateFleet = useCallback(() => {
		refetchFleetFresh();
	}, [refetchFleetFresh]);
	const invalidateAll = useCallback(() => {
		refetchFleetFresh();
		queryClient.invalidateQueries({ queryKey: ["dev-fleet", "disk"] });
	}, [refetchFleetFresh, queryClient]);
	const [busy, setBusy] = useState({});
	const [expanded, setExpanded] = useState({});
	const [detail, setDetail] = useState({});
	const [detailLoading, setDetailLoading] = useState({});
	const [prov, setProv] = useState({});
	const [provLogOpen, setProvLogOpen] = useState({});
	const provDoneTimersRef = useRef({});
	const [rebaseResult, setRebaseResult] = useState({});
	const [gatewayError, setGatewayError] = useState(null);
	const [dismissedUndoKey, setDismissedUndoKey] = useState(readDismissedUndoKey);
	const [podLogs, setPodLogs] = useState({});
	const [podLogsLoading, setPodLogsLoading] = useState({});
	const rebaseTimersRef = useRef({});
	const [q, setQ] = useState("");
	const [sortBy, setSortBy] = useState("status");
	const [showLegacy, setShowLegacy] = useState(false);
	const [syncRun, setSyncRun] = useState(null);
	const [syncLogOpen, setSyncLogOpen] = useState(false);
	const syncAttachedRef = useRef(false);
	const provAttachedRef = useRef(/* @__PURE__ */ new Set());
	const provInFlightRef = useRef(/* @__PURE__ */ new Set());
	const pollAliveRef = useRef(true);
	const cancelledRunsRef = useRef(/* @__PURE__ */ new Set());
	useEffect(() => {
		pollAliveRef.current = true;
		return () => {
			pollAliveRef.current = false;
		};
	}, []);
	function dismissSync(rid) {
		if (rid) cancelledRunsRef.current.add(rid);
		setSyncRun(null);
		setSyncLogOpen(false);
	}
	async function dismissProv(name) {
		const rid = prov[name]?.rid;
		if (rid) try {
			await post("/pod/provision/dismiss", {
				name,
				run_id: rid
			});
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
			return;
		}
		let stale = false;
		setProv((p) => {
			if (p[name]?.rid !== rid) {
				stale = true;
				return p;
			}
			const n = { ...p };
			delete n[name];
			return n;
		});
		if (stale) return;
		clearTimeout(provDoneTimersRef.current[name]);
		setProvLogOpen((o) => {
			const n = { ...o };
			delete n[name];
			return n;
		});
		invalidateFleet();
	}
	function toggleProvLog(name) {
		setProvLogOpen((o) => ({
			...o,
			[name]: !o[name]
		}));
	}
	const [confirmReq, setConfirmReq] = useState(null);
	const [restarting, setRestarting] = useState(false);
	const makeLivePending = Object.entries(busy).some(([k, v]) => v && k.endsWith(":makelive"));
	const gatewayMutating = restarting || makeLivePending;
	const liveStateUnknown = fleet?.live_state_known === false;
	const stagedWorktree = fleet?.staged_cancel_available === true ? (fleet?.worktrees || []).find((x) => x.is_staged && !x.is_live) || null : null;
	const liveWorktree = stagedWorktree ? (fleet?.worktrees || []).find((x) => x.is_live && x.path) || null : null;
	const pendingStage = (fleet?.worktrees || []).find((x) => x.is_staged && !x.is_live) || null;
	const [pruneDialog, setPruneDialog] = useState(null);
	const [pruneSelected, setPruneSelected] = useState(/* @__PURE__ */ new Set());
	const [pruneForceSelected, setPruneForceSelected] = useState(/* @__PURE__ */ new Set());
	const [pruneProgress, setPruneProgress] = useState(null);
	const askConfirm = (title, desc, opts) => new Promise((resolve) => setConfirmReq({
		title,
		desc,
		...opts || {},
		resolve
	}));
	const settleConfirm = (val) => setConfirmReq((c) => {
		if (c) c.resolve(val);
		return null;
	});
	const setFlag = (k, v) => setBusy((b) => ({
		...b,
		[k]: v
	}));
	function showRebaseResult(name, res) {
		setRebaseResult((m) => ({
			...m,
			[name]: res
		}));
		clearTimeout(rebaseTimersRef.current[name]);
		rebaseTimersRef.current[name] = setTimeout(() => setRebaseResult((m) => {
			const n = { ...m };
			delete n[name];
			return n;
		}), res.kind === "ok" ? 15e3 : 6e4);
	}
	function dismissRebaseResult(name) {
		clearTimeout(rebaseTimersRef.current[name]);
		setRebaseResult((m) => {
			const n = { ...m };
			delete n[name];
			return n;
		});
	}
	useEffect(() => {
		if (!fleet?.sync_run_id || syncAttachedRef.current) return;
		if (syncRun?.rid === fleet.sync_run_id) return;
		syncAttachedRef.current = true;
		const rid = fleet.sync_run_id;
		get("/run?id=" + rid).then((run) => {
			if (!run) return;
			const t0 = run.started ? run.started * 1e3 : Date.now();
			const out = run.output || [];
			const last = run.cause || syncFailureTail(out);
			if (run.status === "running") {
				setSyncRun({
					rid,
					status: "running",
					lines: out,
					startedAt: t0,
					stepLabel: run.step_label
				});
				pollSyncRun(rid, t0);
			} else if (run.status === "done" || run.status === "timeout") {
				const okRun = run.exit_code === 0;
				setSyncRun({
					rid,
					status: okRun ? "done" : "error",
					lines: out,
					startedAt: t0,
					exit: run.exit_code,
					last,
					lastIsCause: Boolean(run.cause)
				});
			}
		}).catch(() => {});
	}, [fleet?.sync_run_id]);
	useEffect(() => {
		for (const w of fleet?.worktrees || []) {
			const rid = w.provision_run_id;
			if (!rid || provAttachedRef.current.has(rid)) continue;
			provAttachedRef.current.add(rid);
			const name = w.name;
			get("/run?id=" + rid).then((run) => {
				if (!run) {
					provAttachedRef.current.delete(rid);
					return;
				}
				const t0 = run.started ? run.started * 1e3 : Date.now();
				const lines = run.output || [];
				if (run.status === "running") {
					setProv((p) => ({
						...p,
						[name]: {
							rid,
							status: "running",
							lines,
							startedAt: t0
						}
					}));
					pollProvisionRun(name, rid, t0, lines);
				} else if (run.exit_code !== 0) {
					setProv((p) => ({
						...p,
						[name]: {
							rid,
							status: "failed",
							failed: true,
							lines,
							startedAt: t0,
							exit: run.exit_code ?? null
						}
					}));
					setProvLogOpen((o) => ({
						...o,
						[name]: true
					}));
				}
			}).catch(() => {
				provAttachedRef.current.delete(rid);
			});
		}
	}, [fleet?.worktrees]);
	const [, setTick] = useState(0);
	const provTicking = Object.values(prov).some((p) => !!p && (p.status === "running" || p.status === "starting"));
	useEffect(() => {
		if ((!syncRun || syncRun.status !== "running") && !provTicking) return;
		const t = setInterval(() => setTick((n) => n + 1), 1e3);
		return () => clearInterval(t);
	}, [syncRun?.status, provTicking]);
	async function pollSyncRun(rid, startedAt) {
		if (_activeSyncPolls.has(rid)) {
			_syncStateRelay(rid, startedAt);
			return;
		}
		_activeSyncPolls.add(rid);
		try {
			await _pollSyncRunLoop(rid, startedAt);
		} finally {
			_activeSyncPolls.delete(rid);
		}
	}
	async function _syncStateRelay(rid, startedAt) {
		for (let i = 0; i < 900; i++) {
			await sleep(2e3);
			if (!pollAliveRef.current) return;
			if (cancelledRunsRef.current.has(rid)) return;
			let run = null;
			try {
				run = await get("/run?id=" + rid);
			} catch {
				continue;
			}
			if (!run) continue;
			const t0 = run.started ? run.started * 1e3 : startedAt;
			const out = run.output || [];
			const last = run.cause || syncFailureTail(out);
			if (run.status === "done" || run.status === "timeout") {
				const okRun = run.exit_code === 0;
				setSyncRun({
					rid,
					status: okRun ? "done" : "error",
					lines: out,
					startedAt: t0,
					exit: run.exit_code,
					last,
					lastIsCause: Boolean(run.cause)
				});
				return;
			}
			setSyncRun({
				rid,
				status: "running",
				lines: out,
				startedAt: t0,
				last,
				lastIsCause: Boolean(run.cause),
				stepLabel: run.step_label
			});
		}
	}
	async function _pollSyncRunLoop(rid, startedAt) {
		for (let i = 0; i < 900; i++) {
			await sleep(2e3);
			if (cancelledRunsRef.current.has(rid)) return;
			let run = null;
			let gone = false;
			try {
				run = await get("/run?id=" + rid);
			} catch (e) {
				if (e?.status === 404) gone = true;
				else continue;
			}
			if (gone || !run) {
				if (gone) {
					setSyncRun({
						rid,
						status: "error",
						lines: [],
						startedAt,
						last: i18nT("pages.devFleetPage.gateway_restarted_mid_sync_run_lost_check_git_st")
					});
					setFlag("__syncmain", false);
					notify(i18nT("pages.devFleetPage.sync_run_lost_gateway_restarted_mid_sync_re_run"), { type: "error" });
					return;
				}
				continue;
			}
			const out = run.output || [];
			const t0 = run.started ? run.started * 1e3 : startedAt;
			const last = run.cause || syncFailureTail(out);
			if (run.status === "done" || run.status === "timeout") {
				const okRun = run.exit_code === 0;
				setSyncRun({
					rid,
					status: okRun ? "done" : "error",
					lines: out,
					startedAt: t0,
					exit: run.exit_code,
					last,
					lastIsCause: Boolean(run.cause)
				});
				setFlag("__syncmain", false);
				if (okRun) {
					if (fleet?.gateway_service_active) {
						notify(i18nT("pages.devFleetPage.build_finished_restarting_gateway"), { type: "success" });
						setRestarting(true);
						setGatewayError(null);
						postGateway("/restart-gateway", {}).then(async (r) => {
							if (!r?.ok) {
								const msg = r?.error || i18nT("pages.devFleetPage.restart_failed");
								notify(msg, { type: "error" });
								setGatewayError(msg);
								setRestarting(false);
							} else await awaitGatewayBack(r.start_id ?? null);
						}).catch((e) => {
							const msg = `${i18nT("pages.devFleetPage.restart_failed")}: ${e?.message || String(e)}`;
							notify(msg, { type: "error" });
							setGatewayError(msg);
							setRestarting(false);
						});
					} else notify(i18nT("pages.devFleetPage.synced_restart_gateway_to_apply_the_new_build"), { type: "success" });
				} else if (run.cause) notify(`${i18nT("pages.devFleetPage.pull_build_failed")}: ${run.cause}`, { type: "error" });
				else notify(i18nT("pages.devFleetPage.pull_build_failed_exit_code_detail", {
					code: run.exit_code,
					detail: last
				}), { type: "error" });
				invalidateFleet();
				return;
			}
			setSyncRun({
				rid,
				status: "running",
				lines: out,
				startedAt: t0,
				last,
				lastIsCause: Boolean(run.cause),
				stepLabel: run.step_label
			});
		}
		setSyncRun((s) => s && s.rid === rid ? {
			...s,
			status: "error",
			last: "timed out after 30 min"
		} : s);
		setFlag("__syncmain", false);
	}
	async function toggleExpand(name) {
		const open = !expanded[name];
		setExpanded((e) => ({
			...e,
			[name]: open
		}));
		if (open && !detail[name] && !detailLoading[name]) {
			setDetailLoading((d) => ({
				...d,
				[name]: true
			}));
			try {
				const dd = await get("/worktree?name=" + encodeURIComponent(name));
				setDetail((d) => ({
					...d,
					[name]: dd
				}));
			} catch (e) {
				setDetail((d) => ({
					...d,
					[name]: { error: e?.message || String(e) }
				}));
			} finally {
				setDetailLoading((d) => ({
					...d,
					[name]: false
				}));
			}
		}
	}
	async function act(name, kind) {
		const flag = name + ":" + kind;
		setFlag(flag, true);
		try {
			if (kind === "open") {
				const w = window.open("about:blank", "_blank");
				if (w) w.opener = null;
				let r;
				try {
					r = await postGateway("/pod-token", { name });
				} catch (e) {
					w?.close();
					throw e;
				}
				if (r?.ok && r.url) {
					if (w) w.location.href = r.url;
					else window.open(r.url, "_blank", "noopener");
				} else {
					w?.close();
					notify(r?.error || i18nT("pages.devFleetPage.token_mint_failed"), { type: "error" });
				}
			} else if (kind === "up") {
				notify(i18nT("pages.devFleetPage.starting_pod_for_name_can_take_1_min", { name }), { type: "info" });
				const r = await post("/pod/up", { name });
				notify(r?.ok ? i18nT("pages.devFleetPage.pod_up_name", { name }) : r?.error || i18nT("pages.devFleetPage.pod_start_failed"), { type: r?.ok ? "success" : "error" });
				invalidateFleet();
			} else if (kind === "down") {
				const r = await post("/pod/down", { name });
				notify(r?.ok ? i18nT("pages.devFleetPage.stopped_name", { name }) : r?.error || i18nT("pages.devFleetPage.failed"), { type: r?.ok ? "success" : "error" });
				invalidateFleet();
			} else if (kind === "restart") {
				const r = await post("/pod/restart", { name });
				notify(r?.ok ? i18nT("pages.devFleetPage.restarted_name", { name }) : r?.error || i18nT("pages.devFleetPage.failed"), { type: r?.ok ? "success" : "error" });
				invalidateFleet();
			}
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
		} finally {
			setFlag(flag, false);
		}
	}
	function launchQa(name) {
		const prompt = `Dev Fleet QA for worktree '${name}'. Steps: (1) load the pod-e2e skill (it manages pod lifecycle); (2) ensure the pod is up for this worktree; (3) run the pod-e2e QA suite (backend API + Playwright frontend) against that pod; (4) record a short demo video of the pod dashboard with the feature-demo-recording skill; (5) deliver the video and a concise pass/fail summary. English only.`;
		openChat({
			message: prompt,
			autoSend: true
		});
	}
	async function pollProvisionRun(name, rid, startedAt, seed = []) {
		let acc = seed.slice();
		for (let i = 0; i < 900; i++) {
			await sleep(2e3);
			if (!pollAliveRef.current) return;
			let run = null;
			try {
				run = await get("/run?id=" + rid);
			} catch {
				continue;
			}
			if (!run) continue;
			acc = mergeLogWindow(acc, run.output || []);
			const lines = acc;
			if (run.status === "done") {
				const ok = run.exit_code === 0;
				notify(ok ? i18nT("pages.devFleetPage.provisioned") : i18nT("pages.devFleetPage.provision_failed_exit_code", { code: run.exit_code }), { type: ok ? "success" : "error" });
				if (ok) {
					setProv((p) => ({
						...p,
						[name]: {
							rid,
							status: "done",
							done: true,
							lines,
							startedAt,
							exit: 0
						}
					}));
					invalidateFleet();
					provDoneTimersRef.current[name] = setTimeout(() => {
						setProv((p) => {
							const n = { ...p };
							delete n[name];
							return n;
						});
						setProvLogOpen((o) => {
							const n = { ...o };
							delete n[name];
							return n;
						});
					}, 2500);
				} else {
					setProv((p) => ({
						...p,
						[name]: {
							rid,
							status: "failed",
							failed: true,
							lines,
							startedAt,
							exit: run.exit_code
						}
					}));
					setProvLogOpen((o) => ({
						...o,
						[name]: true
					}));
					invalidateFleet();
				}
				return;
			}
			if (run.status !== "running") {
				notify(run.status === "timeout" ? i18nT("pages.devFleetPage.provision_timed_out") : i18nT("pages.devFleetPage.provision_failed_status", { status: run.status }), { type: "error" });
				setProv((p) => ({
					...p,
					[name]: {
						rid,
						status: "failed",
						failed: true,
						lines: lines.length ? lines : ["Provision " + run.status],
						startedAt,
						exit: run.exit_code ?? null
					}
				}));
				setProvLogOpen((o) => ({
					...o,
					[name]: true
				}));
				invalidateFleet();
				return;
			}
			setProv((p) => ({
				...p,
				[name]: {
					rid,
					status: "running",
					lines,
					startedAt
				}
			}));
		}
		notify(i18nT("pages.devFleetPage.provision_polling_timed_out_check_pod_logs"), { type: "error" });
		setProv((p) => ({
			...p,
			[name]: {
				rid,
				status: "failed",
				failed: true,
				lines: acc.length ? acc : ["Provision polling timed out — check pod logs"],
				startedAt,
				exit: null
			}
		}));
		setProvLogOpen((o) => ({
			...o,
			[name]: true
		}));
		invalidateFleet();
	}
	async function provision(name) {
		if (provInFlightRef.current.has(name)) return;
		provInFlightRef.current.add(name);
		const startedAt = Date.now();
		clearTimeout(provDoneTimersRef.current[name]);
		setProvLogOpen((o) => {
			const n = { ...o };
			delete n[name];
			return n;
		});
		setProv((p) => ({
			...p,
			[name]: {
				status: "starting",
				lines: [],
				startedAt
			}
		}));
		try {
			const r = await post("/pod/provision", { name });
			if (!r?.run_id) {
				notify(i18nT("pages.devFleetPage.provision_failed_to_start"), { type: "error" });
				setProv((p) => ({
					...p,
					[name]: {
						status: "failed",
						failed: true,
						lines: ["Provision failed to start"],
						startedAt,
						exit: null
					}
				}));
				setProvLogOpen((o) => ({
					...o,
					[name]: true
				}));
				return;
			}
			if (provAttachedRef.current.has(r.run_id)) return;
			provAttachedRef.current.add(r.run_id);
			await pollProvisionRun(name, r.run_id, startedAt);
		} catch (e) {
			const msg = e?.message || String(e);
			notify(msg, { type: "error" });
			setProv((p) => ({
				...p,
				[name]: {
					status: "failed",
					failed: true,
					lines: [msg],
					startedAt,
					exit: null
				}
			}));
			setProvLogOpen((o) => ({
				...o,
				[name]: true
			}));
		} finally {
			provInFlightRef.current.delete(name);
		}
	}
	async function removeWorktree(name, d) {
		if (d?.is_main) {
			notify(i18nT("pages.devFleetPage.cannot_remove_the_main_worktree"), { type: "error" });
			return;
		}
		const shipped = !!d?.shipped;
		const empty = d && d.own_commits === 0 && d.real_dirty === false;
		const paths = d?.dirty_untracked_paths ?? [];
		const untrackedOnly = d?.dirty_tracked === false && (d?.dirty_untracked ?? 0) > 0 && paths.length === d?.dirty_untracked;
		const files = paths.join(", ");
		const base = shipped ? i18nT("pages.devFleetPage.pr_merged_safe_to_remove_runs_git_worktree_remov") : empty ? i18nT("pages.devFleetPage.empty_worktree_cannot_be_undone") : i18nT("pages.devFleetPage.has_unmerged_work_removing_deletes_permanently");
		const desc = untrackedOnly ? base + " " + i18nT("pages.devFleetPage.discard_untracked_files", {
			count: d?.dirty_untracked ?? 0,
			files
		}) : base;
		if (!await askConfirm(i18nT("pages.devFleetPage.remove_name", { name }), desc, {
			confirmLabel: shipped || empty ? i18nT("pages.devFleetPage.remove") : i18nT("pages.devFleetPage.delete_anyway"),
			danger: true
		})) return;
		setFlag(name + ":remove", true);
		try {
			const r = await post("/worktree/remove", {
				name,
				force: !shipped && !empty,
				discard_untracked_paths: untrackedOnly ? paths : void 0
			});
			if (r?.ok) {
				notify(i18nT("pages.devFleetPage.removed_name", { name }), { type: "success" });
				invalidateAll();
			} else notify(r?.error || i18nT("pages.devFleetPage.failed"), { type: "error" });
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
		} finally {
			setFlag(name + ":remove", false);
		}
	}
	function syncPostFailure(e) {
		let rid;
		if (e instanceof DevFleetApiError && e.status === 409) try {
			rid = JSON.parse(e.body)?.run_id;
		} catch {}
		return {
			ok: false,
			run_id: typeof rid === "string" && rid ? rid : void 0,
			error: e?.message || String(e)
		};
	}
	async function syncMain() {
		setFlag("__syncmain", true);
		try {
			const r = await post("/sync", {}).catch(syncPostFailure);
			if (!r?.ok && r?.run_id) {
				setSyncRun({
					rid: r.run_id,
					status: "running",
					lines: [],
					startedAt: Date.now()
				});
				pollSyncRun(r.run_id, Date.now());
				return;
			}
			if (!r?.ok || !r.run_id) {
				notify(r?.error || i18nT("pages.devFleetPage.pull_build_failed_to_start"), { type: "error" });
				setFlag("__syncmain", false);
				return;
			}
			setSyncRun({
				rid: r.run_id,
				status: "running",
				lines: [],
				startedAt: Date.now()
			});
			pollSyncRun(r.run_id, Date.now());
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
			setFlag("__syncmain", false);
		}
	}
	async function rebaseWorktree(name) {
		if (!await askConfirm(i18nT("pages.devFleetPage.rebase_name", { name }), i18nT("pages.devFleetPage.fetches_latest_main_and_replays_refused_if_dirty"), { confirmLabel: i18nT("pages.devFleetPage.rebase") })) return;
		setFlag(name + ":rebase", true);
		try {
			const r = await post("/rebase", { name });
			if (r?.ok) {
				const txt = i18nT("pages.devFleetPage.rebased_head", { head: (r.head || "?").slice(0, 7) });
				showRebaseResult(name, {
					kind: "ok",
					text: txt
				});
				notify(txt, { type: "success" });
			} else if (r?.conflict) {
				showRebaseResult(name, {
					kind: "conflict",
					text: i18nT("pages.devFleetPage.conflicts_aborted")
				});
				notify(i18nT("pages.devFleetPage.rebase_conflicts"), { type: "error" });
			} else {
				showRebaseResult(name, {
					kind: "error",
					text: r?.error || "failed"
				});
				notify(r?.error || i18nT("pages.devFleetPage.rebase_failed"), { type: "error" });
			}
			invalidateFleet();
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
		} finally {
			setFlag(name + ":rebase", false);
		}
	}
	async function pruneShipped() {
		setFlag("__prune", true);
		try {
			const r = await get("/prune-candidates");
			if (!r || r.ok === false) {
				notify(r?.error || i18nT("pages.devFleetPage.prune_preview_failed"), { type: "error" });
				return;
			}
			const cands = r.candidates || [];
			const kept = r.kept || [];
			if (!cands.length && !kept.length) {
				notify(i18nT("pages.devFleetPage.nothing_to_prune"), { type: "info" });
				return;
			}
			setPruneSelected(new Set(cands.map((c) => c.name)));
			setPruneForceSelected(/* @__PURE__ */ new Set());
			setPruneDialog({
				candidates: cands,
				kept,
				scanned: r.scanned || 0
			});
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
		} finally {
			setFlag("__prune", false);
		}
	}
	async function pruneExecute(rawNames, rawForceNames = [], discardPaths = {}) {
		const names = Array.from(new Set(rawNames));
		const forceNames = Array.from(new Set(rawForceNames));
		const discardNames = Object.keys(discardPaths);
		const allNames = Array.from(/* @__PURE__ */ new Set([
			...names,
			...forceNames,
			...discardNames
		]));
		if (!allNames.length) {
			notify(i18nT("pages.devFleetPage.nothing_selected"), { type: "info" });
			return;
		}
		setPruneDialog(null);
		const seed = Object.fromEntries(allNames.map((n) => [n, {
			status: "pending",
			error: null
		}]));
		setPruneProgress({
			names: allNames,
			items: seed,
			done: 0,
			total: allNames.length,
			running: true
		});
		try {
			const start = await post("/prune-run", {
				names,
				force_names: forceNames,
				discard_untracked_paths: discardPaths
			});
			if (!start || start.ok === false) {
				notify(start?.error || i18nT("pages.devFleetPage.prune_failed_to_start"), { type: "error" });
				setPruneProgress(null);
				return;
			}
			for (let i = 0; i < 400; i++) {
				await sleep(1500);
				if (!pollAliveRef.current) return;
				let st = null;
				try {
					st = await get("/prune-status");
				} catch {
					continue;
				}
				if (!st) continue;
				const raw = st.items || {};
				const backendTotal = Object.keys(raw).length || allNames.length;
				const items = Object.fromEntries(allNames.map((n) => [n, {
					status: raw[n]?.status || "pending",
					error: raw[n]?.error ?? null
				}]));
				const running = st.running !== false && (st.done || 0) < backendTotal;
				if (!running) {
					for (const n of allNames) if (!raw[n]) items[n] = {
						status: "failed",
						error: "not processed (unknown or no longer a worktree)"
					};
				}
				setPruneProgress({
					names: allNames,
					items,
					done: st.done || 0,
					total: allNames.length,
					running
				});
				if (!running) {
					const removed = allNames.filter((n) => items[n]?.status === "done").length;
					const failed = allNames.filter((n) => items[n]?.status === "failed").length;
					notify(removed > 0 ? failed > 0 ? i18nT("pages.devFleetPage.pruned_worktrees_some_failed", {
						count: removed,
						failed
					}) : i18nT("pages.devFleetPage.pruned_worktrees", { count: removed }) : i18nT("pages.devFleetPage.prune_failed_count", { count: failed }), { type: removed > 0 ? "success" : "error" });
					invalidateAll();
					setTimeout(() => setPruneProgress(null), 5e3);
					return;
				}
			}
			setPruneProgress(null);
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
			setPruneProgress(null);
		}
	}
	async function awaitGatewayBack(capturedId) {
		const result = await awaitGatewayBackGlobal(capturedId);
		if (result === "reloaded") return;
		if (result === "aborted") return;
		setRestarting(false);
		const timedOut = i18nT("pages.devFleetPage.gateway_did_not_come_back_within_60s_reload_the");
		notify(timedOut, { type: "error" });
		setGatewayError(timedOut);
	}
	async function restartGateway() {
		if (!await askConfirm(i18nT("pages.devFleetPage.restart_gateway_2"), pendingStage ? i18nT("pages.devFleetPage.restarting_completes_the_pending_cutover_boots", { staged: pendingStage.name }) : i18nT("pages.devFleetPage.applies_the_last_pull_build_the_dashboard_will_b"), { confirmLabel: i18nT("pages.devFleetPage.restart") })) return;
		setRestarting(true);
		setGatewayError(null);
		try {
			const r = await postGateway("/restart-gateway", {});
			if (!r?.ok) {
				const msg = r?.error || i18nT("pages.devFleetPage.restart_failed");
				notify(msg, { type: "error" });
				setGatewayError(msg);
				setRestarting(false);
				return;
			}
			await awaitGatewayBack(r.start_id ?? null);
		} catch (e) {
			const msg = `${i18nT("pages.devFleetPage.restart_failed")}: ${e?.message || String(e)}`;
			notify(msg, { type: "error" });
			setGatewayError(msg);
			setRestarting(false);
		}
	}
	async function makeLive(w, opts) {
		const undoing = opts?.undo === true;
		const cancellingStage = !undoing && !!("is_live" in w && w.is_live) && !!stagedWorktree;
		if ("is_live" in w && w.is_live && !cancellingStage) return;
		if (!w.path) {
			notify(i18nT("pages.devFleetPage.cannot_resolve_worktree_path_for_name", { name: w.name }), { type: "error" });
			return;
		}
		const canRestart = fleet?.gateway_service_active === true;
		if (!await askConfirm(undoing ? i18nT("pages.devFleetPage.undo_to_name", { name: w.name }) : cancellingStage ? i18nT("pages.devFleetPage.cancel_staged_cutover_2") : i18nT("pages.devFleetPage.make_name_live", { name: w.name }), undoing ? canRestart ? i18nT("pages.devFleetPage.switches_the_live_dashboard_back_to_name_and_restarts", { name: w.name }) : i18nT("pages.devFleetPage.stages_name_as_the_live_target_to_finish_the_undo", {
			name: w.name,
			cmd: fleet?.manual_restart || "kirocrew restart"
		}) : cancellingStage ? i18nT("pages.devFleetPage.keeps_name_the_live_target_and_discards_the_stag", {
			name: w.name,
			staged: stagedWorktree?.name ?? ""
		}) : canRestart ? i18nT("pages.devFleetPage.swaps_the_code_behind_the_live_dashboard_to_this") : i18nT("pages.devFleetPage.stages_the_code_behind_the_live_dashboard_manual", { cmd: fleet?.manual_restart || "kirocrew restart" }), undoing ? { confirmLabel: i18nT("pages.devFleetPage.undo_to_name", { name: w.name }) } : cancellingStage ? {
			confirmLabel: i18nT("pages.devFleetPage.cancel_staged_cutover"),
			cancelLabel: i18nT("pages.devFleetPage.keep_cutover")
		} : { confirmLabel: i18nT("pages.devFleetPage.make_live") })) return;
		setFlag(w.name + ":makelive", true);
		try {
			const r = await postGateway("/make-live", cancellingStage && stagedWorktree?.path ? {
				path: w.path,
				expected_staged: stagedWorktree.path
			} : undoing ? {
				path: w.path,
				undo: true
			} : { path: w.path });
			if (!r?.ok) {
				const msg = r?.error || i18nT(undoing ? "pages.devFleetPage.undo_make_live_failed" : "pages.devFleetPage.make_live_failed");
				notify(msg, { type: "error" });
				setGatewayError(msg);
				setFlag(w.name + ":makelive", false);
				return;
			}
			if (r.cancelled) {
				if (r.notice) notify(r.notice, { type: "info" });
				setFlag(w.name + ":makelive", false);
				invalidateFleet();
				return;
			}
			if (r.staged_only) {
				if (r.notice) notify(r.notice, { type: "info" });
				setFlag(w.name + ":makelive", false);
				invalidateFleet();
				return;
			}
			setRestarting(true);
			await awaitGatewayBack(r.start_id ?? null);
			setFlag(w.name + ":makelive", false);
		} catch (e) {
			const msg = `${i18nT(undoing ? "pages.devFleetPage.undo_make_live_failed" : "pages.devFleetPage.make_live_failed")}: ${e?.message || String(e)}`;
			notify(msg, { type: "error" });
			setGatewayError(msg);
			setRestarting(false);
			setFlag(w.name + ":makelive", false);
		}
	}
	async function loadPodLogs(name) {
		setPodLogsLoading((l) => ({
			...l,
			[name]: true
		}));
		try {
			const r = await get("/pod/logs?name=" + encodeURIComponent(name) + "&n=100");
			if (r?.ok) setPodLogs((l) => ({
				...l,
				[name]: r.logs || "(empty)"
			}));
			else notify(r?.error || i18nT("pages.devFleetPage.failed_to_load_logs"), { type: "error" });
		} catch (e) {
			notify(e?.message || String(e), { type: "error" });
		} finally {
			setPodLogsLoading((l) => ({
				...l,
				[name]: false
			}));
		}
	}
	const wts = fleet?.worktrees || [];
	const running = wts.filter((w) => w.running).length;
	const needsProv = wts.filter((w) => !w.is_main && !w.has_dist).length;
	const undoTarget = fleet?.undo_target?.path ? fleet.undo_target : null;
	const undoCurrent = undoTarget ? wts.find((w) => w.is_live && w.path) || null : null;
	const undoKey = undoCurrent && undoTarget ? JSON.stringify([undoCurrent.path, undoTarget.path]) : null;
	const showUndoBanner = !!undoKey && dismissedUndoKey !== undoKey;
	useEffect(() => {
		if (dismissedUndoKey == null || !fleet || fleetError || fleet.error) return;
		if (undoTarget && !undoCurrent) return;
		if (undoKey !== dismissedUndoKey) {
			setDismissedUndoKey(null);
			persistDismissedUndoKey(null);
		}
	}, [
		dismissedUndoKey,
		fleet,
		fleetError,
		undoKey,
		undoTarget,
		undoCurrent
	]);
	const error = fleetError ? fleetError.message : fleet?.error || null;
	const podsAvailable = fleet?.pods_available !== false;
	const podsReason = fleet?.pods_unavailable_reason || null;
	const gatewayReason = fleet?.gateway_service_active === false ? fleet?.gateway_service_reason || null : null;
	const servingReason = fleet?.serving_install_reason || null;
	const isDiscoveryError = !fleetError && !!fleet?.error;
	const needsSetup = !fleetError && !!fleet?.needs_setup;
	const noFleet = needsSetup || isDiscoveryError || !!fleetError;
	const ql = q.trim().toLowerCase();
	const matchesRow = (w) => !ql || (w.name + " " + (w.branch || "")).toLowerCase().includes(ql);
	const statusRank = (w) => w.is_main ? 0 : w.running ? 1 : !w.has_dist ? 3 : 2;
	const prRank = (w) => {
		if (!w.pr) return 2;
		const s = String(w.pr.state || "").toUpperCase();
		if (s === "MERGED") return 4;
		if (s === "DRAFT" || w.pr.isDraft) return 1;
		if (s === "OPEN") return 0;
		if (s === "CLOSED") return 3;
		return 2;
	};
	const mainRows = wts.filter((w) => w.is_main);
	const legacyAll = wts.filter((w) => !w.is_main && w.legacy);
	const others = wts.filter((w) => !w.is_main && matchesRow(w) && (showLegacy || !w.legacy));
	others.sort((a, b) => sortBy === "name" ? compareText(a.name, b.name) : sortBy === "recent" ? (b.last_updated_at || 0) - (a.last_updated_at || 0) || compareText(a.name, b.name) : sortBy === "behind" ? (b.behind || 0) - (a.behind || 0) || compareText(a.name, b.name) : statusRank(a) - statusRank(b) || prRank(a) - prRank(b) || compareText(a.name, b.name));
	const visible = [...mainRows, ...others];
	const reviewState = (w) => {
		if (!w.pr) return null;
		const s = String(w.pr?.state || "").toUpperCase();
		if (s === "MERGED") return {
			word: "merged",
			variant: "aim"
		};
		if (s === "DRAFT" || w.pr?.isDraft) return {
			word: "draft",
			variant: "warn"
		};
		if (s === "OPEN") return {
			word: "open",
			variant: "ok"
		};
		if (s === "CLOSED") return {
			word: "closed",
			variant: "err"
		};
		return {
			word: "…",
			variant: "warn"
		};
	};
	function stateDot(w) {
		let variant, label, title;
		if (w.is_main) {
			variant = "aim";
			label = "main";
			title = i18nT("pages.devFleetPage.the_primary_checkout_this_fleet_is_discovered_fr");
		} else if (w.running) {
			const healthy = !!w.health && (w.health >= 200 && w.health < 400 || w.health === 401 || w.health === 403);
			variant = healthy ? "ok" : "err";
			label = healthy ? i18nT("pages.devFleetPage.pod_up") : i18nT("pages.devFleetPage.pod_sick");
			title = healthy ? i18nT("pages.devFleetPage.qa_pod_is_running_click_open_to_use_it") : i18nT("pages.devFleetPage.qa_pod_is_running_but_failing_its_health_check");
		} else if (!w.has_dist) {
			variant = "muted";
			label = i18nT("pages.devFleetPage.not_built");
			title = i18nT("pages.devFleetPage.no_venv_ui_build_yet_provision_builds_this_workt");
		} else if (!podsAvailable) {
			variant = "muted";
			label = i18nT("pages.devFleetPage.built");
			title = i18nT("pages.devFleetPage.built_but_pods_cannot_run_on_this_host_preview_i");
		} else {
			variant = "muted";
			label = "ready";
			title = i18nT("pages.devFleetPage.built_and_ready_spin_up_a_pod_from_the_row_menu");
		}
		return /* @__PURE__ */ jsx(Badge, {
			variant,
			className: "text-[10.5px] px-1.5 py-0",
			title,
			children: label
		});
	}
	/** A failed or conflicting rebase, as its own block under the row. The inputs
	*  are all in git (nothing typed here), so the hand-off is on. */
	function renderRebaseFailure(w) {
		const rr = rebaseResult[w.name];
		if (!rr || rr.kind === "ok") return null;
		return /* @__PURE__ */ jsx("div", {
			style: { margin: "2px 0 8px 32px" },
			children: /* @__PURE__ */ jsx(ErrorNotice, {
				message: rr.text,
				askAgent: true,
				onDismiss: () => dismissRebaseResult(w.name),
				testId: `rebase-error-${w.name}`
			})
		});
	}
	const columnHeader = /* @__PURE__ */ jsxs("div", {
		style: {
			display: "grid",
			gridTemplateColumns: "16px 84px minmax(0,1fr) 64px 48px 104px 212px",
			gap: 8,
			alignItems: "center",
			padding: "2px 0 4px",
			fontSize: 10,
			textTransform: "uppercase",
			letterSpacing: "0.06em",
			color: "var(--muted)",
			minWidth: 640
		},
		children: [
			/* @__PURE__ */ jsx("span", {}),
			/* @__PURE__ */ jsx("span", { children: i18nT("pages.devFleetPage.pod_2") }),
			/* @__PURE__ */ jsx("span", { children: i18nT("pages.devFleetPage.worktree") }),
			/* @__PURE__ */ jsx("span", { children: i18nT("pages.devFleetPage.pr_2") }),
			/* @__PURE__ */ jsx("span", {
				title: i18nT("pages.devFleetPage.commits_behind_main"),
				children: i18nT("pages.devFleetPage.behind")
			}),
			/* @__PURE__ */ jsx("span", {
				title: i18nT("pages.devFleetPage.last_commit_activity"),
				children: i18nT("pages.devFleetPage.updated")
			}),
			/* @__PURE__ */ jsx("span", {
				style: { textAlign: "right" },
				children: i18nT("pages.devFleetPage.actions")
			})
		]
	});
	function renderRow(w) {
		const open = !!expanded[w.name];
		const rs = reviewState(w);
		const mut = {
			fontSize: 12.5,
			color: "var(--muted)",
			fontVariantNumeric: "tabular-nums",
			fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
		};
		const prUrl = w.pr?.url || "";
		const isMainWithStepper = w.is_main && syncRun;
		const pr = prov[w.name];
		const provActive = !w.is_main && !!pr;
		return /* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsxs("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "16px 84px minmax(0,1fr) 64px 48px 104px 212px",
					gap: 8,
					alignItems: "center",
					padding: "5px 0",
					borderTop: "1px solid var(--border)",
					minHeight: 30,
					minWidth: 640
				},
				children: [
					w.is_main ? /* @__PURE__ */ jsx("span", { style: { width: 15 } }) : /* @__PURE__ */ jsx(Clickable, {
						"aria-label": open ? i18nT("pages.devFleetPage.collapse") : i18nT("pages.devFleetPage.expand"),
						"aria-expanded": open,
						onClick: () => toggleExpand(w.name),
						style: {
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "var(--muted)",
							display: "flex",
							padding: 0,
							transform: open ? "rotate(90deg)" : "none",
							transition: "transform .12s"
						},
						children: /* @__PURE__ */ jsx(ChevronRight, {
							size: 15,
							className: "lucide-inline"
						})
					}),
					/* @__PURE__ */ jsx("span", {
						style: {
							overflow: "hidden",
							display: "flex"
						},
						children: stateDot(w)
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							minWidth: 0,
							display: "flex",
							alignItems: "baseline",
							gap: 6,
							whiteSpace: "nowrap",
							overflow: "hidden"
						},
						children: [
							/* @__PURE__ */ jsx("span", {
								style: {
									fontFamily: "ui-monospace, monospace",
									fontSize: 13.5,
									fontWeight: 600,
									overflow: "hidden",
									textOverflow: "ellipsis"
								},
								children: w.name
							}),
							w.dirty ? /* @__PURE__ */ jsx("span", {
								title: i18nT("pages.devFleetPage.uncommitted_changes"),
								children: "•"
							}) : null,
							w.is_main ? fleet?.base_branch && w.branch && w.branch !== fleet.base_branch ? /* @__PURE__ */ jsx(Badge, {
								variant: "warn",
								className: "text-[10px] px-1.5 py-0",
								title: i18nT("pages.devFleetPage.the_primary_checkout_is_on_branch_not_base", {
									branch: w.branch,
									base: fleet.base_branch
								}),
								children: i18nT("pages.devFleetPage.parked_on_branch", { branch: w.branch })
							}) : /* @__PURE__ */ jsx("span", {
								style: mut,
								children: i18nT("pages.devFleetPage.main")
							}) : null,
							w.is_live ? fleet?.live_verified === false ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Badge, {
								variant: "warn",
								className: "text-[10px] px-1.5 py-0",
								title: i18nT("pages.devFleetPage.marked_live_but_this_install_cant_confirm_it"),
								children: i18nT("pages.devFleetPage.live_unverified")
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[10px] text-muted",
								"data-testid": "fleet-live-unverified-reason",
								title: i18nT("pages.devFleetPage.marked_live_but_this_install_cant_confirm_it"),
								style: {
									overflow: "hidden",
									textOverflow: "ellipsis",
									minWidth: 0,
									flex: "1 1 0%",
									whiteSpace: "nowrap"
								},
								children: i18nT("pages.devFleetPage.marked_live_but_this_install_cant_confirm_it")
							})] }) : /* @__PURE__ */ jsx(Badge, {
								variant: "aim",
								className: "text-[10px] px-1.5 py-0",
								title: i18nT("pages.devFleetPage.the_live_gateway_on_this_port_runs_from_this_che"),
								children: i18nT("pages.devFleetPage.live")
							}) : null,
							w.is_staged ? /* @__PURE__ */ jsx(Badge, {
								variant: "warn",
								className: "text-[10px] px-1.5 py-0",
								title: stagedWorktree?.name === w.name ? i18nT("pages.devFleetPage.cutover_staged_run_cmd_to_finish_or_cancel", { cmd: fleet?.manual_restart || "kirocrew restart" }) : i18nT("pages.devFleetPage.cutover_staged_run_the_restart_command_to_finish", { cmd: fleet?.manual_restart || "kirocrew restart" }),
								children: i18nT("pages.devFleetPage.restart_pending")
							}) : null,
							w.summary ? /* @__PURE__ */ jsx("span", {
								title: w.summary,
								style: {
									fontSize: 11.5,
									color: "var(--muted)",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									minWidth: 0,
									flex: "0 1 auto"
								},
								children: w.summary
							}) : null,
							w.running && !w.is_main ? /* @__PURE__ */ jsx(PodReadout, { r: w.pod_resources }) : null
						]
					}),
					isMainWithStepper ? /* @__PURE__ */ jsx(DevFleetSyncStepper, {
						syncRun,
						syncLogOpen,
						setSyncLogOpen,
						dismissSync
					}) : provActive ? /* @__PURE__ */ jsx(DevFleetProvStepper, {
						w,
						prov,
						provLogOpen,
						dismissProv,
						toggleProvLog
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [
						rs && prUrl ? /* @__PURE__ */ jsx("a", {
							href: prUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							title: w.pr?.title || rs.word,
							style: { textDecoration: "none" },
							children: /* @__PURE__ */ jsx(Badge, {
								variant: rs.variant,
								children: rs.word
							})
						}) : /* @__PURE__ */ jsx("span", {
							style: {
								...mut,
								opacity: .5
							},
							children: "—"
						}),
						/* @__PURE__ */ jsx("span", {
							style: {
								...mut,
								opacity: (w.behind ?? 0) > 0 ? 1 : .5
							},
							title: (w.behind ?? 0) > 0 ? i18nT("pages.devFleetPage.commits_behind_main_2", { count: w.behind ?? 0 }) : i18nT("pages.devFleetPage.up_to_date_with_main"),
							children: (w.behind ?? 0) > 0 ? "↓" + w.behind : "—"
						}),
						/* @__PURE__ */ jsx("span", {
							title: relTime(w.last_updated_at),
							style: {
								...mut,
								opacity: .85,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: relTime(w.last_updated_at)
						}),
						/* @__PURE__ */ jsx("div", {
							style: {
								display: "flex",
								gap: 6,
								justifyContent: "flex-end",
								alignItems: "center",
								minWidth: 0,
								flexWrap: "wrap"
							},
							children: /* @__PURE__ */ jsx(DevFleetRowActions, {
								w,
								fleet,
								busy,
								rebaseResult,
								syncRun,
								gatewayMutating,
								liveStateUnknown,
								stagedWorktree,
								liveWorktree,
								dismissRebaseResult,
								act,
								launchQa,
								provision,
								syncMain,
								rebaseWorktree,
								restartGateway,
								makeLive,
								podsAvailable
							})
						})
					] })
				]
			}),
			renderRebaseFailure(w),
			w.is_main && syncRun && syncLogOpen ? /* @__PURE__ */ jsx("pre", {
				style: {
					margin: "2px 0 8px 32px",
					padding: "8px 10px",
					maxHeight: 180,
					overflow: "auto",
					fontSize: 11,
					lineHeight: 1.45,
					background: "var(--bg)",
					border: "1px solid var(--border)",
					borderRadius: 8,
					whiteSpace: "pre-wrap",
					wordBreak: "break-all",
					minWidth: 640
				},
				children: filterStepMarkers(syncRun.lines || []).join("\n") || "(no output yet)"
			}) : null,
			provActive && provLogOpen[w.name] && pr ? /* @__PURE__ */ jsx(ProvLogPre, {
				lines: pr.lines || [],
				streaming: pr.status === "running" || pr.status === "starting"
			}) : null,
			open && detailLoading[w.name] ? /* @__PURE__ */ jsx(ContentSkeleton, { rows: 3 }) : null,
			open && detail[w.name] ? /* @__PURE__ */ jsx("div", {
				style: {
					padding: "4px 0 14px 30px",
					fontSize: 12,
					minWidth: 640
				},
				children: detail[w.name].error ? /* @__PURE__ */ jsx(ErrorNotice, {
					message: detail[w.name].error,
					askAgent: true,
					testId: `worktree-detail-error-${w.name}`
				}) : /* @__PURE__ */ jsx(DetailPanel, {
					w,
					d: detail[w.name],
					busy,
					onRemove: () => removeWorktree(w.name, {
						...w,
						...detail[w.name]
					}),
					onLoadLogs: () => loadPodLogs(w.name),
					logs: podLogs[w.name],
					logsLoading: podLogsLoading[w.name]
				})
			}) : null
		] }, w.name);
	}
	const legacyToggle = legacyAll.length > 0 ? /* @__PURE__ */ jsx(Btn, {
		onClick: () => setShowLegacy((v) => !v),
		style: {
			display: "block",
			width: "100%",
			textAlign: "left",
			marginTop: 4,
			fontSize: 11.5,
			color: "var(--muted)",
			background: "transparent",
			border: "1px dashed var(--border)",
			minWidth: 640
		},
		title: i18nT("pages.devFleetPage.worktrees_created_under_a_previous_repository_na"),
		children: showLegacy ? i18nT("pages.devFleetPage.hide_legacy_worktrees", { n: legacyAll.length }) : i18nT("pages.devFleetPage.legacy_worktrees_hidden_show", { n: legacyAll.length })
	}) : null;
	let body;
	if (loading && !fleet) body = /* @__PURE__ */ jsx(ContentSkeleton, { rows: 5 });
	else if (needsSetup) body = /* @__PURE__ */ jsxs("div", {
		role: "region",
		"aria-labelledby": "devfleet-setup-title",
		"data-testid": "devfleet-needs-setup",
		style: {
			padding: 24,
			borderRadius: 8,
			border: "1px solid var(--border)",
			background: "var(--card)"
		},
		children: [
			/* @__PURE__ */ jsx("h2", {
				id: "devfleet-setup-title",
				style: {
					margin: 0,
					fontWeight: 600,
					fontSize: 15
				},
				children: i18nT("pages.devFleetPage.no_checkout_found")
			}),
			/* @__PURE__ */ jsx("p", {
				style: {
					margin: "8px 0 0",
					color: "var(--muted)",
					fontSize: 14
				},
				children: i18nT("pages.devFleetPage.no_checkout_found_help")
			}),
			/* @__PURE__ */ jsx("p", {
				style: {
					margin: "8px 0 0",
					fontSize: 14
				},
				children: i18nT("pages.devFleetPage.no_checkout_found_action")
			}),
			/* @__PURE__ */ jsx("p", {
				style: {
					margin: "8px 0 0",
					fontFamily: "ui-monospace, monospace",
					fontSize: 13,
					color: "var(--text)",
					overflowWrap: "anywhere"
				},
				children: i18nT("pages.devFleetPage.no_checkout_found_env_example")
			})
		]
	});
	else if (error) {
		const statusErrText = appStatusError instanceof Error ? appStatusError.message : appStatusError ? String(appStatusError) : "";
		const exhausted = statusErrText ? null : restartExhaustedNotice(i18nT("apps.devFleet.manifest.display_name"), devFleetAppStatus);
		const backendMessage = statusErrText ? `${error} (${statusErrText})` : error;
		body = isDiscoveryError ? /* @__PURE__ */ jsx(ErrorNotice, {
			title: i18nT("pages.devFleetPage.discovery_error"),
			message: error,
			askAgent: true,
			testId: "fleet-discovery-error"
		}) : exhausted ? /* @__PURE__ */ jsx(ErrorNotice, {
			title: exhausted.title,
			message: exhausted.message,
			askAgent: true,
			testId: "fleet-backend-restart-exhausted"
		}) : /* @__PURE__ */ jsx(ErrorNotice, {
			title: i18nT("pages.devFleetPage.backend_unavailable"),
			message: backendMessage,
			askAgent: true,
			testId: "fleet-backend-error"
		});
	} else if (!wts.length) body = /* @__PURE__ */ jsx(EmptyState, {
		icon: /* @__PURE__ */ jsx(Server, {
			size: 28,
			className: "lucide-inline"
		}),
		title: i18nT("pages.devFleetPage.no_worktrees_found"),
		subtitle: i18nT("pages.devFleetPage.nothing_under_the_worktrees_root_yet")
	});
	else body = /* @__PURE__ */ jsxs("div", { children: [
		fleet?.live_state_known === false && /* @__PURE__ */ jsx(ErrorNotice, {
			title: i18nT("pages.devFleetPage.live_state_unknown"),
			message: i18nT("pages.devFleetPage.live_state_unknown_help"),
			askAgent: true,
			actionPlacement: "below",
			testId: "fleet-live-state-unknown"
		}),
		columnHeader,
		visible.map(renderRow),
		legacyToggle
	] });
	const confirmDialog = /* @__PURE__ */ jsx(Modal, {
		open: !!confirmReq,
		onClose: () => settleConfirm(false),
		title: confirmReq?.title ?? "",
		maxWidth: confirmReq?.width || 400,
		footer: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Btn, {
			onClick: () => settleConfirm(false),
			children: confirmReq?.cancelLabel || i18nT("pages.devFleetPage.cancel")
		}), /* @__PURE__ */ jsx(Btn, {
			primary: !confirmReq?.danger,
			danger: !!confirmReq?.danger,
			onClick: () => settleConfirm(true),
			children: confirmReq?.confirmLabel || i18nT("pages.devFleetPage.confirm")
		})] }),
		children: /* @__PURE__ */ jsx("p", {
			className: "text-sm text-muted m-0",
			children: confirmReq?.desc
		})
	});
	const pruneReviewDialog = pruneDialog && /* @__PURE__ */ jsx(DevFleetPruneReview, {
		fleet,
		pruneDialog,
		setPruneDialog,
		pruneSelected,
		setPruneSelected,
		pruneForceSelected,
		setPruneForceSelected,
		askConfirm,
		pruneExecute
	});
	const pruneProgressModal = pruneProgress && /* @__PURE__ */ jsx(DevFleetPruneProgress, {
		pruneProgress,
		setPruneProgress
	});
	const diskGb = disk?.total_mb != null ? fmtUnit(disk.total_mb / 1024, "gigabyte", { maximumFractionDigits: 0 }) : "…";
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		confirmDialog,
		/* @__PURE__ */ jsx(ToastHost, {}),
		pruneReviewDialog,
		pruneProgressModal,
		restarting && /* @__PURE__ */ jsxs("div", {
			role: "alert",
			"aria-busy": "true",
			style: {
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background: "var(--bg)",
				color: "var(--text)"
			},
			children: [
				/* @__PURE__ */ jsx(LoaderCircle, {
					size: 32,
					className: "lucide-inline animate-spin"
				}),
				/* @__PURE__ */ jsx("p", {
					style: {
						marginTop: 16,
						fontSize: 16,
						fontWeight: 600
					},
					children: i18nT("pages.devFleetPage.restarting_reconnecting")
				}),
				/* @__PURE__ */ jsx("p", {
					style: {
						fontSize: 12,
						color: "var(--muted)"
					},
					children: i18nT("pages.devFleetPage.waiting_for_the_new_gateway_process_the_page_rel")
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "flex flex-1 min-h-0 overflow-hidden",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex-1 min-w-0 flex flex-col min-h-0",
				children: [/* @__PURE__ */ jsx(PageHeader, {
					title: i18nT("pages.devFleetPage.dev_fleet"),
					subtitle: i18nT("pages.devFleetPage.manage_the_git_worktrees_of_your_main_checkout_s")
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex-1 overflow-y-auto px-4 md:px-6 pb-8 min-h-0",
					children: [/* @__PURE__ */ jsx(DevFleetPageNotices, {
						fleet,
						diskFailed,
						diskError,
						actionError,
						actionErrorRef,
						dismissActionError,
						gatewayError,
						setGatewayError,
						setDismissedUndoKey,
						gatewayMutating,
						makeLive,
						wts,
						running,
						needsProv,
						undoTarget,
						undoCurrent,
						undoKey,
						showUndoBanner,
						podsAvailable,
						podsReason,
						gatewayReason,
						servingReason,
						noFleet,
						diskGb
					}), /* @__PURE__ */ jsxs(Card, { children: [
						/* @__PURE__ */ jsx(CardTitle, { children: /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1.5",
							children: [noFleet ? i18nT("pages.devFleetPage.worktrees") : i18nT("pages.devFleetPage.worktrees_count", { count: wts.length }), !noFleet && /* @__PURE__ */ jsx(InfoTip, { text: i18nT("pages.devFleetPage.every_git_worktree_of_the_main_checkout_pull_bui") })]
						}) }),
						!noFleet && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap gap-2.5 items-center mt-3 mb-1",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "flex-1 min-w-[140px]",
									children: /* @__PURE__ */ jsx(SearchInput, {
										placeholder: i18nT("pages.devFleetPage.filter_worktrees"),
										value: q,
										onChange: (e) => setQ(e.target.value),
										"aria-label": i18nT("pages.devFleetPage.filter_worktrees_2")
									})
								}),
								/* @__PURE__ */ jsx("span", {
									style: {
										fontSize: 11.5,
										color: "var(--muted)",
										flexShrink: 0
									},
									children: ql ? i18nT("pages.devFleetPage.rows_filtered_count", {
										count: wts.length,
										shown: fmtNumber$1(others.length),
										n: fmtNumber$1(wts.length)
									}) : i18nT("pages.devFleetPage.rows_count", {
										count: wts.length,
										n: fmtNumber$1(wts.length)
									})
								}),
								/* @__PURE__ */ jsx(SimpleSelect, {
									options: [
										"status",
										"recent",
										"name",
										"behind"
									],
									optionLabels: [
										i18nT("pages.devFleetPage.sort_status"),
										i18nT("pages.devFleetPage.sort_recent"),
										i18nT("pages.devFleetPage.sort_name"),
										i18nT("pages.devFleetPage.sort_behind")
									],
									value: sortBy,
									onChange: setSortBy,
									"aria-label": i18nT("pages.devFleetPage.sort_worktrees"),
									style: { flexShrink: 0 }
								}),
								/* @__PURE__ */ jsx(Btn, {
									danger: !busy["__prune"],
									onClick: pruneShipped,
									disabled: !!busy["__prune"],
									"aria-busy": !!busy["__prune"],
									children: iconLabel(busy["__prune"] ? /* @__PURE__ */ jsx(LoaderCircle, { className: "lucide-inline animate-spin" }) : /* @__PURE__ */ jsx(Trash2, {
										size: 13,
										className: "lucide-inline"
									}), i18nT(busy["__prune"] ? "pages.devFleetPage.scanning_merged" : "pages.devFleetPage.prune_merged"))
								}),
								/* @__PURE__ */ jsx(Btn, {
									onClick: () => invalidateAll(),
									disabled: loading,
									"aria-label": i18nT("pages.devFleetPage.refresh_fleet"),
									children: iconLabel(/* @__PURE__ */ jsx(RefreshCw, {
										size: 14,
										className: "lucide-inline"
									}), i18nT("pages.devFleetPage.refresh"))
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "overflow-x-auto -mx-1 px-1",
							children: body
						})
					] })]
				})]
			})
		})
	] });
}
// src/index.tsx
/**
* The bundle's entry: AppHost lazy-imports this module and renders its default
* export as the app's page.
*
* It binds the host's permission-scoped API client before any child renders, and
* subscribes to the host's language generation, which is what repaints the page on
* a language switch: `t` reads the active locale at call time, and this
* component's re-render reaches every child.
*/
function DevFleetApp() {
	bindAppApi(useAppApi());
	useLanguageGeneration();
	return /* @__PURE__ */ jsx(DevFleetPage, {});
}
export { DevFleetApp as default };
