<!DOCTYPE html>
<html>
  <head>
    <title>BoxJs</title>
    <meta charset="utf-8" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <link rel="Bookmark" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
    <link rel="shortcut icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
    <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/chavyleung/scripts/master/BOXJS.png" />
    <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/vuetify@2.4.x/dist/vuetify.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <style>
      #BG {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 0;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        background-color: transparent;
      }
      @media (prefers-color-scheme: light) {
        body {
          background-color: #fff;
        }
      }
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #121212;
        }
      }
      [v-cloak] {
        display: none;
      }
      .v-navigation-drawer {
        padding-top: constant(safe-area-inset-top) !important;
        padding-top: env(safe-area-inset-top) !important;
      }
      .v-bottom-sheet.v-dialog--fullscreen {
        padding-top: constant(safe-area-inset-top) !important;
        padding-top: env(safe-area-inset-top) !important;
      }
      .v-app-bar.safe {
        height: auto !important;
        padding-top: constant(safe-area-inset-top) !important;
        padding-top: env(safe-area-inset-top) !important;
      }
      .v-toolbar.safe {
        height: auto !important;
        padding-top: constant(safe-area-inset-top) !important;
        padding-top: env(safe-area-inset-top) !important;
      }
      .v-toolbar__content {
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
      .v-main {
        margin-top: constant(safe-area-inset-top) !important;
        margin-top: env(safe-area-inset-top) !important;
        margin-bottom: constant(safe-area-inset-bottom) !important;
        margin-bottom: env(safe-area-inset-bottom) !important;
      }
      .v-main .container {
        height: 100%;
      }
      .v-bottom-navigation,
      .v-bottom-sheet {
        padding-bottom: constant(safe-area-inset-bottom);
        padding-bottom: env(safe-area-inset-bottom);
      }
      .v-bottom-navigation {
        box-sizing: content-box;
      }
      .v-bottom-navigation button {
        box-sizing: border-box;
      }
      .v-bottom-navigation button.v-btn:before {
        background-color: transparent;
      }
      .v-speed-dial {
        margin-bottom: calc(48px + constant(safe-area-inset-bottom));
        margin-bottom: calc(48px + env(safe-area-inset-bottom));
      }
      .container.container--fluid {
        padding-bottom: 68px;
      }
      .appicon {
        user-select: none;
        -webkit-user-select: none;
      }
    </style>
  </head>
  <body>
    <div id="BG"></div>
    <div id="app" v-cloak>
      <v-app v-if="box" :style="appViewStyle">
        <v-app-bar
          ref="appBar"
          v-bind="appBarBind"
          :class="!$refs.appBar || $refs.appBar.isActive ? 'safe' : undefined"
          :value="!isHidedSearchBar"
          v-touch="{ up: () => isHidedSearchBar = true }"
        >
          <!-- 搜索条 -->
          <v-autocomplete v-bind="ui.searchBar" :label="title" @click="ui.searchDialog.show = true" hide-no-data hide-details solo>
            <template #prepend-inner>
              <!-- 容器切换 Surge、QuanX、Loon -->
              <v-menu bottom left v-if="!isLoading && isMainView">
                <template #activator="{ on }">
                  <v-btn v-on="on" icon class="ml-n3">
                    <v-avatar size="26">
                      <img :src="env.icons[iconEnvThemeIdx]" />
                    </v-avatar>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item dense v-for="(env, envIdx) in envs" :key="env.id" @click="switchEnv(env.id)">
                    <v-list-item-avatar size="26">
                      <v-img :src="env.icon" />
                    </v-list-item-avatar>
                    <v-list-item-title>{{env.id}}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <!-- 返回按钮 -->
              <v-btn icon class="ml-n3" @click="back" v-else-if="!isLoading && !isMainView">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn icon class="ml-n3" v-show="isLoading" :loading="isLoading" color="primary"></v-btn>
            </template>
            <template #append>
              <v-btn icon class="mr-n3" @click="ui.naviDrawer.show = true">
                <v-avatar size="26">
                  <v-icon>mdi-menu</v-icon>
                </v-avatar>
              </v-btn>
            </template>
          </v-autocomplete>
        </v-app-bar>
        <v-dialog v-model="ui.searchDialog.show" fullscreen scrollable>
          <v-card class="align-self-start">
            <v-card-subtitle class="pa-0">
              <v-toolbar v-bind="searchBarBind" class="safe">
                <v-btn icon dark @click="ui.searchDialog.show = false">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-text-field ref="search" v-model="ui.searchBar.input" :label="title" autofocus hide-details solo></v-text-field>
                <v-btn icon @click="open(box.syscfgs.orz3.repo)">
                  <v-avatar size="26">
                    <img :src="box.syscfgs.orz3.icon" />
                  </v-avatar>
                </v-btn>
              </v-toolbar>
            </v-card-subtitle>
            <v-card-text class="px-0">
              <v-list nav>
                <v-list-item
                  v-for="(app, appIdx) in searchApps"
                  :key="appIdx"
                  @click="ui.searchDialog.show = false, switchAppView(app.id)"
                  dense
                >
                  <v-list-item-avatar class="elevation-3">
                    <img :src="app.icon" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{`${app.name} (${app.id})`}}</v-list-item-title>
                    <v-list-item-subtitle>{{app.repo}}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{app.author}}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click.stop="ui.searchDialog.show = false, favApp(app.id)">
                      <v-icon :color="app.favIconColor" v-text="app.favIcon" />
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-dialog>
        <!-- 侧栏 -->
        <v-navigation-drawer app v-model="ui.naviDrawer.show" height="100%" temporary right disable-route-watcher>
          <v-list dense nav>
            <v-list-item dense>
              <v-list-item-avatar @click="open(box.syscfgs.boxjs.repo)" class="elevation-3">
                <v-img :src="box.syscfgs.boxjs.icon"></v-img>
              </v-list-item-avatar>
              <v-row justify="start" no-gutters>
                <v-col v-for="(c, cIdx) in ui.collaborators" cols="4" :key="c.id">
                  <a>
                    <v-avatar size="40" @click="open(c.repo)" class="elevation-3">
                      <img :src="c.icon" />
                    </v-avatar>
                  </a>
                </v-col>
              </v-row>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item class="pt-1">
              <v-progress-linear :active="isLoading" height="1" absolute top indeterminate></v-progress-linear>
              <v-row justify="start" no-gutters>
                <v-col v-for="(c, cIdx) in ui.contributors" cols="2" :key="c.id">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <a>
                        <v-avatar v-on="on" class="ma-1 elevation-3" size="26" @click="open(c.repo)">
                          <v-img :src="c.icon"></v-img>
                        </v-avatar>
                      </a>
                    </template>
                    <span>{{c.login}}</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item v-if="box.syscfgs.env === 'Surge'">
              <v-list-item-content>
                <v-select
                  v-if="box.usercfgs.httpapis"
                  hide-details
                  v-model="box.usercfgs.httpapi"
                  :items="box.usercfgs.httpapis.split(',')"
                  @change="saveUserCfgs"
                  label="HTTP-API (Surge)"
                ></v-select>
                <v-text-field
                  v-else
                  label="HTTP-API (Surge)"
                  v-model="box.usercfgs.httpapi"
                  hint="Surge http-api 地址."
                  placeholder="examplekey@127.0.0.1:6166"
                  persistent-hint
                  @change="saveUserCfgs"
                  :rules="[(val)=> /.*?@.*?:[0-9]+/.test(val) || '格式错误: examplekey@127.0.0.1:6166']"
                ></v-text-field>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-select
                  :items="[{text: 'English', value: 'en-US'}, {text: '简体中文', value: 'zh-CN'}]"
                  hide-details
                  label="Language"
                  v-model="box.usercfgs.lang"
                ></v-select>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-select
                  :items="[{text: $t('prefs.appearances.auto'), value: 'auto'}, {text: $t('prefs.appearances.dark'), value: 'dark'}, {text: $t('prefs.appearances.light'), value: 'light'}]"
                  :label="$t('prefs.appearance')"
                  hide-details
                  v-model="box.usercfgs.theme"
                ></v-select>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="mt-4" v-show="box.usercfgs.bgimgs">
              <v-list-item-content>
                <v-select
                  :items="bgimgs"
                  :label="$t('prefs.background')"
                  @change="saveUserCfgs"
                  hide-details
                  item-text="name"
                  item-value="url"
                  v-model="box.usercfgs.bgimg"
                ></v-select>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hide-details="isDarkMode"
                :hint="$t('prefs.iconDesc')"
                :label="$t('prefs.icon')"
                :persistent-hint="true"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                v-model="box.usercfgs.isTransparentIcons"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text @click="open(box.syscfgs.orz3.repo)">
                <v-avatar size="32">
                  <img :src="box.syscfgs.orz3.icon" />
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.bgModeDesc')"
                :label="$t('prefs.bgMode')"
                :persistent-hint="true"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                v-model="isWallpaperMode"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-image</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.hideTopBarDesc')"
                :label="$t('prefs.hideTopBar')"
                :persistent-hint="true"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                v-model="box.usercfgs.isHidedSearchBar"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-dock-top</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.autoTopBarDesc')"
                :label="$t('prefs.autoTopBar')"
                :persistent-hint="true"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                v-model="isAutoSearchBar"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-format-align-top</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.hideBottomBarDesc')"
                :label="$t('prefs.hideBottomBar')"
                :persistent-hint="true"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                v-model="box.usercfgs.isHidedNaviBottom"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-dock-bottom</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.autoBottomBarDesc')"
                :label="$t('prefs.autoBottomBar')"
                :persistent-hint="true"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                v-model="isAutoNaviBottom"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-format-align-bottom</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <!-- <v-list-item class="mt-4"><v-switch
                dense
                class="mt-0"
                label="透明主题"
                v-model="box.usercfgs.isTransparent"
                @change="saveUserCfgs"
                :persistent-hint="true"
                hint="使界面更多元素透明 (beta)"
              ></v-switch><v-spacer></v-spacer><v-btn fab small text><v-avatar size="32"><v-icon>mdi-invert-colors</v-icon></v-avatar></v-btn></v-list-item> -->
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.muteModeDesc')"
                :label="$t('prefs.muteMode')"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                persistent-hint
                v-model="box.usercfgs.isMute"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-volume-off</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.hideHelpDesc')"
                :label="$t('prefs.hideHelp')"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                persistent-hint
                v-model="box.usercfgs.isHideHelp"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text @click="open(box.syscfgs.boxjs.repo)">
                <v-avatar size="32">
                  <v-icon>mdi-help</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.hideBoxJsDesc')"
                :label="$t('prefs.hideBoxJs')"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                persistent-hint
                v-model="box.usercfgs.isHideBoxIcon"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text @click="open(box.syscfgs.boxjs.repo)">
                <v-avatar size="32">
                  <img :src="box.syscfgs.boxjs.icons[iconThemeIdx]" />
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.hideProfileTitleDesc')"
                :label="$t('prefs.hideProfileTitle')"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                persistent-hint
                v-model="box.usercfgs.isHideMyTitle"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar v-if="box.usercfgs.icon" size="32">
                  <img :src="box.usercfgs.icon" />
                </v-avatar>
                <v-icon v-else size="32">mdi-face-profile</v-icon>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.hideCoddingDesc')"
                :label="$t('prefs.hideCodding')"
                dense
                class="mt-0"
                persistent-hint
                v-model="box.usercfgs.isHideCoding"
                @change="saveUserCfgs"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-code-tags</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.hideReloadDesc')"
                :label="$t('prefs.hideReload')"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                persistent-hint
                v-model="box.usercfgs.isHideRefresh"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-refresh</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item class="mt-4">
              <v-switch
                :hint="$t('prefs.debugModeDesc')"
                :label="$t('prefs.debugMode')"
                @change="saveUserCfgs"
                class="mt-0"
                dense
                persistent-hint
                v-model="box.usercfgs.isDebugWeb"
              ></v-switch>
              <v-spacer></v-spacer>
              <v-btn fab small text>
                <v-avatar size="32">
                  <v-icon>mdi-language-html5</v-icon>
                </v-avatar>
              </v-btn>
            </v-list-item>
            <v-list-item v-if="box.usercfgs.isDebugWeb">
              <v-list-item-content>
                <v-text-field
                  :hint="$t('prefs.debugPageDesc')"
                  :label="$t('prefs.debugPage')"
                  @change="saveUserCfgs"
                  clearable
                  persistent-hint
                  placeholder="http://ip:port/boxjs.html"
                  v-model="box.usercfgs.debugger_web"
                ></v-text-field>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="mt-4"></v-list-item>
          </v-list>
        </v-navigation-drawer>
        <!-- 主页 -->
        <v-main class="appBarBind.app ? 'safe' : ''" v-scroll="onScroll">
          <v-snackbar top app v-model="ui.snackbar.show" v-bind="ui.snackbar">{{ui.snackbar.msg}}</v-snackbar>
          <!-- 主页 -->
          <v-container
            fluid
            v-show="view === ''"
            v-touch="{
              up: () => {
                if (isWallpaperMode) {
                  clearWallpaper()
                  setWallpaper()
                }
              },
              down: () => {
                if (isWallpaperMode) {
                  isWallpaperMode = !isWallpaperMode
                  changeWallpaper()
                }
              }
            }"
          >
            <v-row no-gutters v-show="!isHidedAppIcons" class="align-self-start" id="appList">
              <v-col cols="3" md="2" v-for="(app, appIdx) in favApps" :key="app.id" class="d-flex justify-space-around">
                <div class="ma-2 appicon" @click="switchAppView(app.id)">
                  <v-card v-if="isDarkMode" style="border-radius: 12px">
                    <v-img style="border-radius: 12px" :aspect-ratio="1" width="54" height="54" contain v-ripple :src="app.icon"></v-img>
                  </v-card>
                  <v-img
                    v-else
                    style="border-radius: 12px"
                    :aspect-ratio="1"
                    width="54"
                    height="54"
                    contain
                    v-ripple
                    class="elevation-3"
                    :src="app.icon"
                  ></v-img>
                  <p class="text-center ma-0">
                    <span class="d-inline-block text-truncate font-weight-bold" :style="appIconFontStyle"> {{app.name}} </span>
                  </p>
                </div>
              </v-col>
            </v-row>
          </v-container>
          <!-- 应用列表 -->
          <v-container fluid v-show="view === 'app' && !curapp">
            <!-- 收藏应用 -->
            <v-expansion-panels multiple class="mb-4" v-if="favApps.length > 0" v-model="box.usercfgs.favapppanel">
              <v-expansion-panel>
                <v-expansion-panel-header> {{ $t('apps.fav') }} ({{favApps.length}}) </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-list dense nav class="ma-n4">
                    <template v-for="(app, appIdx) in favApps">
                      <v-list-item dense @click="switchAppView(app.id)" :key="app.id">
                        <v-list-item-avatar class="elevation-3">
                          <v-img :src="app.icon" />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{app.name}} ({{app.id}})</v-list-item-title>
                          <v-list-item-subtitle>{{app.repo}}</v-list-item-subtitle>
                          <v-list-item-subtitle>{{app.author}}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-menu bottom left>
                            <template #activator="{ on }">
                              <v-btn icon v-on="on">
                                <v-icon>mdi-dots-vertical</v-icon>
                              </v-btn>
                            </template>
                            <v-list>
                              <v-list-item dense v-if="appIdx > 0" @click="moveFav(appIdx, -1)">
                                <v-list-item-title>{{ $t('base.sort.up') }}</v-list-item-title>
                              </v-list-item>
                              <v-list-item dense v-if="appIdx + 1 < favApps.length" @click="moveFav(appIdx, 1)">
                                <v-list-item-title>{{ $t('base.sort.dn') }}</v-list-item-title>
                              </v-list-item>
                              <v-divider v-if="favApps.length > 1"></v-divider>
                              <v-list-item dense @click="favApp(app.id)">
                                <v-list-item-title>{{ $t('apps.unStar') }}</v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </v-list-item-action>
                      </v-list-item>
                      <!-- <v-divider inset v-if="favApps.length !== appIdx + 1"></v-divider> -->
                    </template>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <!-- 订阅应用 -->
            <v-expansion-panels multiple class="mb-4" v-if="appSubs.length > 0" v-model="box.usercfgs.subapppanel">
              <v-expansion-panel v-for="(sub, subIdx) in appSubs" :key="sub.id" v-if="!sub.isErr">
                <v-expansion-panel-header> {{sub.name}} ({{sub.apps.length}}) </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-list dense nav class="ma-n4">
                    <template v-for="(app, appIdx) in sub.apps">
                      <v-list-item dense @click="switchAppView(app.id)" :key="app.id">
                        <v-list-item-avatar class="elevation-3">
                          <v-img :src="app.icon" />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{app.name}} ({{app.id}})</v-list-item-title>
                          <v-list-item-subtitle>{{app.repo}}</v-list-item-subtitle>
                          <v-list-item-subtitle>{{app.author}}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon @click.stop="favApp(app.id)">
                            <v-icon :color="app.favIconColor" v-text="app.favIcon" />
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                      <!-- <v-divider inset v-if="sub.apps.length !== appIdx + 1"></v-divider> -->
                    </template>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <!-- 内置应用 -->
            <v-expansion-panels multiplev-if="sysApps.length > 0" v-model="box.usercfgs.sysapppanel">
              <v-expansion-panel>
                <v-expansion-panel-header> {{ $t('apps.sysApps') }} ({{sysApps.length}}) </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-list dense nav class="ma-n4">
                    <template v-for="(app, appIdx) in sysApps">
                      <v-list-item dense @click="switchAppView(app.id)" :key="app.id">
                        <v-list-item-avatar class="elevation-3">
                          <v-img :src="app.icon" />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title>{{app.name}} ({{app.id}})</v-list-item-title>
                          <v-list-item-subtitle>{{app.repo}}</v-list-item-subtitle>
                          <v-list-item-subtitle>{{app.author}}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon @click.stop="favApp(app.id)">
                            <v-icon :color="app.favIconColor" v-text="app.favIcon" />
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                      <!-- <v-divider inset v-if="sysApps.length !== appIdx + 1"></v-divider> -->
                    </template>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
          <!-- 订阅列表 -->
          <v-container fluid v-show="view === 'sub'">
            <template v-if="appSubs.length === 0">
              <v-btn block class="primary" @click="addAppSubDialog = true">{{ $t('subs.add') }}</v-btn>
              <v-btn block class="primary" @click="open('https://chavyleung.gitbook.io/boxjs/awesome/subscriptions')">
                <v-icon class="mr-2">mdi-cloud</v-icon>{{ $t('subs.moreSubs') }}
              
              </v-btn>
            </template>
            <v-card v-else>
              <v-list dense nav>
                <v-subheader inset dense>
                  {{ $t('subs.appSubs') }} ({{appSubs.length}})
                  
                  <v-spacer></v-spacer>
                  <v-btn icon @click="open('https://chavyleung.gitbook.io/boxjs/awesome/subscriptions')">
                    <v-icon>mdi-cloud-circle</v-icon>
                  </v-btn>
                  <v-btn icon @click="reloadAppSub()">
                    <v-icon>mdi-refresh-circle</v-icon>
                  </v-btn>
                  <v-btn icon>
                    <v-icon color="primary" @click="addAppSubDialog = true">mdi-plus-circle</v-icon>
                  </v-btn>
                </v-subheader>
                <template v-for="(sub, subIdx) in appSubs">
                  <v-list-item dense two-line @click="reloadAppSub(sub)" :key="sub.id">
                    <v-list-item-avatar v-if="sub.icon">
                      <v-img :src="sub.icon" />
                    </v-list-item-avatar>
                    <v-list-item-avatar v-else color="primary">
                      <v-icon dark>mdi-account</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{sub.name}} ({{sub.apps.length}})
                        
                        <v-chip v-if="sub.isErr" color="pink" dark x-small class="ml-1 mb-1">{{ $t('subs.errData') }}</v-chip>
                      </v-list-item-title>
                      <v-list-item-subtitle>{{sub.repo ? sub.repo : sub.url}}</v-list-item-subtitle>
                      <v-list-item-subtitle>{{sub.author ? sub.author : '@anonymous'}}</v-list-item-subtitle>
                      <v-list-item-subtitle>
                        {{ $t('subs.updated') }}: {{ timeago.format(sub.updateTime, timeagoLang.replace('-', '_')) }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-menu bottom left>
                        <template #activator="{ on }">
                          <v-btn icon v-on="on">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item @click="open(sub.repo)">
                            <v-list-item-title>{{ $t('subs.repo') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="copy(sub.url)">
                            <v-list-item-title>{{ $t('base.cmd.cp') }}</v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item v-if="subIdx > 0" @click="moveSub(subIdx, -1)">
                            <v-list-item-title>{{ $t('base.sort.up') }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item v-if="subIdx + 1 < appSubs.length" @click="moveSub(subIdx, 1)">
                            <v-list-item-title>{{ $t('base.sort.dn') }}</v-list-item-title>
                          </v-list-item>
                          <v-divider></v-divider>
                          <v-list-item @click="delSub(subIdx)">
                            <v-list-item-title class="text-uppercase red--text">{{ $t('base.cmd.del') }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-list-item-action>
                  </v-list-item>
                  <!-- <v-divider inset v-if="appSubs.length !== subIdx + 1"></v-divider> -->
                </template>
              </v-list>
            </v-card>
            <v-dialog v-model="addAppSubDialog" scrollable>
              <v-card>
                <v-card-title>{{ $t('subs.addDialog.title') }}</v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-textarea
                    :label="$t('subs.addDialog.url')"
                    :hint="$t('subs.addDialog.urlDesc')"
                    autofocus
                    clearable
                    persistent-hint
                    rows="3"
                    v-model="ui.addAppSubDialog.url"
                  ></v-textarea>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text small color="grey" @click="addAppSubDialog = false"> {{$t('base.dialog.close')}} </v-btn>
                  <v-btn text small color="primary" @click="addAppSub(ui.addAppSubDialog.url)" :loading="isLoading">
                    {{$t('base.dialog.save')}}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-container>
          <!-- 我的 -->
          <v-container fluid v-show="view === 'my'">
            <v-card class="mx-auto">
              <v-card-title class="headline">
                {{box.usercfgs.name ? box.usercfgs.name : $t('profile.leaveName')}}
                
                <v-spacer></v-spacer>
                <v-dialog v-model="ui.editProfileDialog.show">
                  <template #activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon>mdi-cog-outline</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>{{ $t('profile.editor.title') }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-text-field
                        :hint="$t('profile.editor.nameDesc')"
                        :label="$t('profile.editor.name')"
                        v-model="box.usercfgs.name"
                      ></v-text-field>
                      <v-text-field
                        :hint="$t('profile.editor.avatarDesc')"
                        :label="$t('profile.editor.avatar')"
                        v-model="box.usercfgs.icon"
                      ></v-text-field>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text small color="grey" @click="ui.editProfileDialog.show = false">{{ $t('base.dialog.close') }}</v-btn>
                      <v-btn text small color="primary" @click="ui.editProfileDialog.show = false" :loading="isLoading">
                        {{ $t('base.dialog.save') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <v-card-text>
                <span class="subheading">{{ $t('profile.datas') }}</span>
                <v-chip-group>
                  <v-chip small>{{ $t('profile.apps') }}: {{this.apps.length}}</v-chip>
                  <v-chip small>{{ $t('profile.subs') }}: {{this.appSubs.length}}</v-chip>
                  <v-chip small>{{ $t('profile.sessions') }}: {{this.sessions.length}}</v-chip>
                </v-chip-group>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn small class="mr-2" @click="switchView('viewer')"> {{ $t('profile.dataviewer')}} </v-btn>
                <v-dialog v-model="ui.impGlobalBakDialog.show">
                  <template #activator="{ on }">
                    <v-btn small v-on="on">{{ $t('profile.imp') }}</v-btn>
                  </template>
                  <v-card>
                    <v-card-title> {{ $t('profile.impDialog.title') }} </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-textarea
                        :hint="$t('profile.impDialog.impDataDesc')"
                        :label="$t('profile.impDialog.impData')"
                        autofocus
                        clearable
                        rows="3"
                        v-model="ui.impGlobalBakDialog.impval"
                      ></v-textarea>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text small color="grey" text @click="ui.impGlobalBakDialog.show = false">{{ $t('base.dialog.close') }}</v-btn>
                      <v-btn text small color="primary" text @click="impGlobalBak" :loading="isLoading">{{ $t('profile.imp') }}</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-btn small @click="saveGlobalBak">{{ $t('profile.bak') }}</v-btn>
              </v-card-actions>
            </v-card>
            <v-card class="mt-4" v-if="box.globalbaks">
              <template v-for="(bak, bakIdx) in box.globalbaks">
                <v-divider v-if="bakIdx>0"></v-divider>
                <v-list-item dense @click="switchBakView(bak.id)">
                  <v-list-item-content>
                    <v-list-item-title>{{bak.name}}</v-list-item-title>
                    <v-list-item-subtitle>{{dayjs(bak.createTime).format('YYYY-MM-DD HH:mm:ss')}}</v-list-item-subtitle>
                    <v-list-item-subtitle>
                      <v-chip x-small class="mr-2" v-for="(tag, tagIdx) in bak.tags" :key="tagIdx">{{tag}}</v-chip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon>
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </template>
            </v-card>
          </v-container>
          <!-- 数据查看 -->
          <v-container fluid v-show="view === 'viewer'">
            <v-card class="mb-4">
              <v-subheader>
                {{ $t('viewer.dataViewer') }}
                
                <v-spacer></v-spacer>
                <v-btn color="primary" small @click="copy(ui.viewer.key)"> {{ $t('base.cmd.cp') }} </v-btn>
              </v-subheader>
              <v-card-text>
                <v-text-field
                  :hint="$t('viewer.dataKeyDesc')"
                  :label="$t('viewer.dataKey')"
                  persistent-hint
                  placeholder="boxjs_host"
                  v-model="ui.viewer.key"
                ></v-text-field>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <!-- TODO 列出最近查询过的 key -->
                <v-spacer></v-spacer>
                <v-btn small text color="primary" @click="queryData">{{ $t('base.dialog.view') }}</v-btn>
              </v-card-actions>
            </v-card>
            <v-card class="mb-4">
              <v-subheader>
                {{ $t('viewer.dataEditor') }}
                
                <v-spacer></v-spacer>
                <v-btn color="primary" small @click="copy(ui.viewer.val)"> {{ $t('base.cmd.cp') }} </v-btn>
              </v-subheader>
              <v-card-text>
                <v-textarea v-model="ui.viewer.val" :row="3" :label="$t('viewer.dataVal')"></v-textarea>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn small text color="primary" @click="saveData">{{ $t('base.dialog.save') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-container>
          <!-- 代码编辑 -->
          <v-container fluid v-show="view === 'coding'">
            <v-card rounded="0" flat style="width: inherit">
              <v-subheader>
                <h2>{{ $t('codding.title') }}</h2>
                <v-spacer></v-spacer>
                <v-btn icon @click="runTxtScript" :loading="isLoading">
                  <v-icon color="primary">mdi-play-circle</v-icon>
                </v-btn>
              </v-subheader>
            </v-card>
            <div class="pa-0" id="container" style="width: inherit; height: inherit"></div>
          </v-container>
          <!-- 应用详情 -->
          <v-container fluid v-if="view === 'app' && !!curapp">
            <v-subheader>
              <h2 :style="appTitleStyle">{{curapp.name}}</h2>
              <v-spacer></v-spacer>
              <v-btn v-if="curapp.script" icon :loading="isLoading" @click="runRemoteScript(curapp.script, curapp.script_timeout)">
                <v-icon color="primary">mdi-play-circle</v-icon>
              </v-btn>
            </v-subheader>
            <v-card class="mb-4" v-if="curapp.desc || curapp.descs || curapp.desc_html || curapp.descs_html">
              <v-card-subtitle>
                <p v-if="curapp.desc" v-text="curapp.desc" class="text-pre-wrap"></p>
                <p
                  v-for="(desc, descIdx) in curapp.descs"
                  v-text="desc"
                  :class="curapp.descs.length === descIdx + 1 ? 'text-pre-wrap' : 'mb-0 text-pre-wrap'"
                ></p>
                <p v-if="curapp.desc_html" v-html="curapp.desc_html"></p>
                <div v-for="(desc_html, desc_htmlIdx) in curapp.descs_html" v-html="desc_html"></div>
              </v-card-subtitle>
            </v-card>
            <v-card class="mb-4">
              <template v-if="curapp.scripts">
                <v-subheader> {{ $t('appDetail.scripts') }} ({{curapp.scripts.length}}) </v-subheader>
                <v-list dense>
                  <v-list-item v-for="(script, scriptIdx) in curapp.scripts" :key="scriptIdx">
                    <v-list-item-title> {{scriptIdx + 1}}. {{script.name}} </v-list-item-title>
                    <v-btn icon :loading="isLoading" @click.stop="runRemoteScript(script.script, script.script_timeout)">
                      <v-icon>mdi-play-circle</v-icon>
                    </v-btn>
                  </v-list-item>
                </v-list>
              </template>
            </v-card>
            <v-card class="mb-4">
              <template v-if="curapp.settings">
                <v-subheader> {{ $t('appDetail.settings') }} ({{curapp.settings.length}}) </v-subheader>
                <v-form class="pl-4 pr-4 pb-4">
                  <template v-for="(setting, settingIdx) in curapp.settings">
                    <v-slider
                      v-model="setting.val"
                      v-bind="setting"
                      class="mt-4"
                      dense
                      persistent-hint
                      :label="setting.name"
                      :hint="setting.desc"
                      thumb-label="always"
                      v-if="setting.type === 'slider'"
                    ></v-slider>
                    <v-switch
                      v-model="setting.val"
                      class="mt-2"
                      persistent-hint
                      dense
                      :label="setting.name"
                      :hint="setting.desc"
                      v-else-if="setting.type === 'boolean'"
                    ></v-switch>
                    <v-textarea
                      v-model="setting.val"
                      v-bind="setting"
                      class="mt-4"
                      :row="3"
                      :label="setting.name"
                      :hint="setting.desc"
                      v-else-if="setting.type === 'textarea'"
                    ></v-textarea>
                    <v-radio-group
                      v-model="setting.val"
                      v-bind="setting"
                      persistent-hint
                      class="mt-0"
                      :hint="setting.desc"
                      v-else-if="setting.type === 'radios'"
                    >
                      <v-subheader class="mb-n4 pa-0">{{setting.name}}</v-subheader>
                      <v-radio
                        :class="itemIdx === 0 ? 'mt-2' : ''"
                        v-for="(item, itemIdx) in setting.items"
                        :label="item.label"
                        :value="item.key"
                        :key="item.key"
                      ></v-radio>
                    </v-radio-group>
                    <template v-else-if="setting.type === 'checkboxes'">
                      <v-subheader class="mb-n8 pa-0">{{setting.name}}</v-subheader>
                      <v-item-group class="mt-4 pt-1">
                        <v-checkbox
                          v-model="setting.val"
                          class="mt-0"
                          persistent-hint
                          :hide-details="itemIdx + 1 !== setting.items.length"
                          :hint="setting.desc"
                          :label="item.label"
                          :value="item.key"
                          v-for="(item, itemIdx) in setting.items"
                          :key="item.key"
                          multiple
                        ></v-checkbox>
                      </v-item-group>
                    </template>
                    <template v-else-if="setting.type === 'colorpicker'">
                      <v-subheader class="mb-n2 pa-0">{{setting.name}}</v-subheader>
                      <v-color-picker
                        v-model="setting.val"
                        v-bind="setting"
                        class="mt-2 mb-4"
                        persistent-hint
                        :hint="setting.desc"
                        :hide-canvas="!setting.canvas"
                        :dot-size="30"
                        mode="hexa"
                        light
                      ></v-color-picker>
                    </template>
                    <div class="mt-4" v-else-if="setting.type === 'number'">
                      <v-text-field
                        v-model="setting.val"
                        v-bind="setting"
                        type="number"
                        :label="setting.name"
                        :hint="setting.desc"
                      ></v-text-field>
                    </div>
                    <div class="mt-4" v-else-if="setting.type === 'selects'">
                      <v-select
                        v-model="setting.val"
                        v-bind="setting"
                        persistent-hint
                        type="number"
                        item-text="label"
                        item-value="key"
                        :items="setting.items"
                        :label="setting.name"
                        :hint="setting.desc"
                      ></v-select>
                    </div>
                    <div class="mt-4" v-else>
                      <v-text-field v-model="setting.val" v-bind="setting" :label="setting.name" :hint="setting.desc"></v-text-field>
                    </div>
                  </template>
                </v-form>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn small text color="primary" @click="saveAppSettings">{{ $t('base.dialog.save') }}</v-btn>
                </v-card-actions>
              </template>
            </v-card>
            <v-card class="mx-auto" v-if="curapp.datas && curapp.datas.length > 0">
              <v-subheader>
                {{ $t('appDetail.curSession') }}
                
                <a class="ml-2">{{curapp.curSession ? curapp.curSession.name : ''}}</a>
                <v-spacer></v-spacer>
                <v-menu bottom left>
                  <template #activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item @click="copy(JSON.stringify(curapp))">
                      <v-list-item-title>{{ $t('base.cmd.cp') }}</v-list-item-title>
                    </v-list-item>
                    <v-dialog v-model="ui.impAppDatasDialog.show">
                      <template #activator="{ on }">
                        <v-list-item v-on="on">
                          <v-list-item-title>{{ $t('base.cmd.imp') }}</v-list-item-title>
                        </v-list-item>
                      </template>
                      <v-card>
                        <v-card-title> {{ $t('appDetail.impDialog.title') }} </v-card-title>
                        <v-divider></v-divider>
                        <v-card-text>
                          <v-textarea
                            v-model="ui.impAppDatasDialog.impval"
                            rows="3"
                            clearable
                            autofocus
                            :label="$t('appDetail.impDialog.data')"
                            :hint="$t('appDetail.impDialog.dataDesc')"
                          ></v-textarea>
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn text small color="grey" text @click="ui.impAppDatasDialog.show = false">
                            {{ $t('base.dialog.close') }}
                          </v-btn>
                          <v-btn text small color="primary" text @click="impAppDatas()" :loading="isLoading">
                            {{ $t('base.cmd.imp') }}
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-list-item @click="copyData(curapp)">
                      <v-list-item-title>{{ $t('appDetail.copyDatas') }}</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="clearAppDatas()">
                      <v-list-item-title class="text-uppercase red--text">{{ $t('appDetail.clearDatas') }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-subheader>
              <v-list-item two-line dense v-for="(data, dataIdx) in curapp.datas" :key="dataIdx">
                <v-list-item-content>
                  <v-list-item-title>{{data.key}}</v-list-item-title>
                  <v-list-item-subtitle>{{data.val ? data.val : $t('appDetail.noDatas')}}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click.stop="clearAppDatas(data.key)">
                    <v-icon color="grey">mdi-close</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn small text color="primary" @click="saveAppSession">{{ $t('base.cmd.duplicate') }}</v-btn>
              </v-card-actions>
            </v-card>
            <v-card :id="session.id" class="ml-10 mt-4" v-for="(session, sessionIdx) in curapp.sessions" :key="session.id">
              <v-subheader>
                <a v-if="curapp.curSession && curapp.curSession.id === session.id">#{{sessionIdx + 1}} {{session.name}}</a>
                <template v-else>#{{sessionIdx + 1}} {{session.name}}</template>
                <v-spacer></v-spacer>
                <v-menu bottom left>
                  <template #activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-dialog v-model="ui.modSessionDialog.show">
                      <template #activator="{ on }">
                        <v-list-item v-on="on">
                          <v-list-item-title>{{ $t('base.cmd.mod') }}</v-list-item-title>
                        </v-list-item>
                      </template>
                      <v-card>
                        <v-card-title>{{ $t('appDetail.sessionEditor.title') }}</v-card-title>
                        <v-divider></v-divider>
                        <v-card-text>
                          <v-text-field class="mt-4" :label="$t('appDetail.sessionEditor.name')" v-model="session.name"></v-text-field>
                          <v-text-field
                            v-for="(data, dataIdx) in session.datas"
                            :key="dataIdx"
                            v-model="data.val"
                            :label="data.key"
                          ></v-text-field>
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn text small color="grey" text @click="ui.modSessionDialog.show = false"
                            >{{ $t('base.dialog.close') }}</v-btn
                          >
                          <v-btn text small color="primary" text @click="updateAppSession(session)" :loading="isLoading"
                            >{{ $t('base.dialog.save') }}</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-divider></v-divider>
                    <v-list-item @click="delAppSession(session.id)">
                      <v-list-item-title>{{ $t('base.cmd.del') }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-subheader>
              <v-list-item two-line dense v-for="(data, dataIdx) in session.datas" :key="dataIdx">
                <v-list-item-content>
                  <v-list-item-title>{{data.key}}</v-list-item-title>
                  <v-list-item-subtitle>{{data.val ? data.val : $t('appDetail.noDatas')}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-card-actions>
                <v-btn small text color="grey">{{dayjs(session.createTime).format('YYYY-MM-DD HH:mm:ss')}}</v-btn>
                <v-spacer></v-spacer>
                <v-btn small text color="primary" @click="useAppSession(session.id)">{{ $t('base.dialog.apply') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-container>
          <!-- 备份详情 -->
          <v-container fluid v-else-if="view === 'bak' && !!curbak">
            <v-subheader>
              <h2 :style="appTitleStyle">{{curbak.name}}</h2>
              <v-spacer></v-spacer>
              <v-btn color="primary" small @click="revertGlobalBak"> {{ $t('base.cmd.recovery') }} </v-btn>
            </v-subheader>
            <v-card class="mb-4">
              <v-subheader> {{ $t('bakDetail.title') }} </v-subheader>
              <v-card-text>
                <v-text-field :label="$t('bakDetail.id')" v-model="curbak.id" readonly></v-text-field>
                <v-text-field :label="$t('bakDetail.name')" v-model="curbak.name" @change="updateGlobalBak"></v-text-field>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn small text color="error" @click="delGlobalBak">{{ $t('base.cmd.del') }}</v-btn>
              </v-card-actions>
            </v-card>
            <v-card class="mb-4">
              <v-subheader>
                {{ $t('bakDetail.dataTitle') }}
                
                <v-spacer></v-spacer>
                <v-btn color="primary" small @click="copy(JSON.stringify(curbak.bak))"> {{ $t('base.cmd.cp') }} </v-btn>
              </v-subheader>
            </v-card>
          </v-container>
        </v-main>
        <!-- 底部 -->
        <v-bottom-navigation ref="naviBar" v-bind="naviBarBind" v-touch="{ down: () => isHidedNaviBottom = true }">
          <v-progress-linear :active="isLoading" height="2" absolute top indeterminate></v-progress-linear>
          <v-btn @click="switchView('')" value="">{{ $t('menus.home') }}
            <v-icon>mdi-home</v-icon>
          </v-btn>
          <v-btn @click="switchView('app')" value="app">{{ $t('menus.apps') }}
            <v-icon>mdi-application</v-icon>
          </v-btn>
          <v-btn @click="switchView('sub')" value="sub">{{ $t('menus.subs') }}
            <v-icon>mdi-database</v-icon>
          </v-btn>
          <v-btn @click="switchView('my')" value="my">
            <template v-if="myIcon">
              <span v-if="!isHideMyTitle">{{ $t('menus.profile') }}</span>
              <v-avatar :size="isHideMyTitle ? 36 : 24">
                <v-img :src="myIcon" />
              </v-avatar>
            </template>
            <template v-else>
              <span v-if="!isHideMyTitle">{{ $t('menus.profile') }}</span>
              <v-icon :size="isHideMyTitle ? 36 : 24">mdi-face-profile</v-icon>
            </template>
          </v-btn>
        </v-bottom-navigation>
        <v-fab-transition>
          <v-speed-dial
            v-show="!box.usercfgs.isHideBoxIcon && !isWallpaperMode"
            direction="top"
            fixed
            fab
            bottom
            :left="box.usercfgs.isLeftBoxIcon"
            :right="!box.usercfgs.isLeftBoxIcon === true"
          >
            <template #activator>
              <v-btn
                fab
                text
                @dblclick="reload()"
                v-touch="{
                  left: () => box.usercfgs.isLeftBoxIcon = true,
                  right: () => box.usercfgs.isLeftBoxIcon = false,
                  up: () => {
                    clearWallpaper()
                    setWallpaper()
                  },
                  down: () => {
                    isWallpaperMode = !!!isWallpaperMode
                    changeWallpaper()
                  }
                }"
              >
                <v-avatar>
                  <img :src="box.syscfgs.boxjs.icons[iconThemeIdx]" />
                </v-avatar>
              </v-btn>
            </template>
            <v-btn dark v-if="!box.usercfgs.isHideHelp" fab small color="grey" @click="open('https://chavyleung.gitbook.io/boxjs')">
              <v-icon>mdi-help</v-icon>
            </v-btn>
            <v-btn dark v-if="!box.usercfgs.isHideHelp" fab small color="purple" @click="ui.versionsheet.show = true">
              <v-icon>mdi-new-box</v-icon>
            </v-btn>
            <v-btn dark fab small color="pink" @click="box.usercfgs.isLeftBoxIcon = !box.usercfgs.isLeftBoxIcon">
              <v-icon> {{box.usercfgs.isLeftBoxIcon ? 'mdi-format-horizontal-align-right' : 'mdi-format-horizontal-align-left'}} </v-icon>
            </v-btn>
            <v-btn dark v-if="!box.usercfgs.isHideRefresh" fab small color="orange" @click="reload()">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn dark v-if="!box.usercfgs.isHideCoding" fab small @click="switchView('coding')">
              <v-icon>mdi-code-tags</v-icon>
            </v-btn>
            <v-btn dark v-if="!box.usercfgs.isHidedSearch" fab small color="green" @click="ui.searchDialog.show = true">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-speed-dial>
        </v-fab-transition>
        <v-bottom-sheet v-model="ui.versionsheet.show" scrollable fullscreen>
          <v-card v-if="box.versions">
            <v-subheader v-touch="{ down: () => ui.versionsheet.show = false }">
              <v-btn icon small @click="open('https://chavyleung.gitbook.io/boxjs/base/upgrade')">
                <v-icon>mdi-help-circle</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn text small v-if="hasNewVersion">新版本</v-btn>
              <v-spacer></v-spacer>
              <v-btn icon small @click="ui.versionsheet.show = false">
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </v-subheader>
            <v-divider></v-divider>
            <v-card-text style="height: 80%">
              <div class="mt-6" v-for="(ver, verIdx) in box.versions">
                <h2 :class="version === ver.version ? 'primary--text' : undefined">v{{ver.version}}</h2>
                <div class="pl-4 pt-2" v-for="(note, noteIdx) in ver.notes">
                  <strong>{{note.name}}</strong>
                  <ul>
                    <li v-for="(desc, descIdx) in note.descs">{{desc}}</li>
                  </ul>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-bottom-sheet>
        <v-bottom-sheet v-model="ui.exeScriptSheet.show" scrollable fullscreen>
          <v-card>
            <v-card-title v-touch="{ down: () => ui.exeScriptSheet.show = false }">
              执行结果
              
              <v-spacer></v-spacer>
              <v-btn icon @click="ui.exeScriptSheet.show = false">
                <v-icon>mdi-chevron-double-down</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text style="height: 80%">
              <div class="mt-4" v-if="ui.exeScriptSheet.resp">
                <p class="text-pre-wrap" v-if="ui.exeScriptSheet.resp.exception" v-text="ui.exeScriptSheet.resp.exception"></p>
                <p class="text-pre-wrap" v-else-if="ui.exeScriptSheet.resp.output" v-text="ui.exeScriptSheet.resp.output"></p>
                <p v-else v-text="JSON.stringify(ui.exeScriptSheet.resp)"></p>
              </div>
            </v-card-text>
          </v-card>
        </v-bottom-sheet>
      </v-app>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue-i18n@8.x/dist/vue-i18n.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vuetify@2.4.x/dist/vuetify.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/lodash@4.x/lodash.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@0.x/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.x/dist/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/timeago.js@4.x/dist/timeago.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uuid@8.x/dist/umd/uuidv4.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue-clipboard2@0.x/dist/vue-clipboard.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/min/vs/loader.js"></script>
    <script>
      Vue.prototype.timeago = timeago
      Vue.prototype.dayjs = dayjs
      new Vue({
        el: '#app',
        vuetify: new Vuetify(),
        i18n: new VueI18n({
          locale: 'zh-CN',
          messages: {
            'en-US': {
              base: {
                dialog: {
                  apply: 'Apply',
                  save: 'Save',
                  view: 'View',
                  close: 'Close'
                },
                sort: {
                  up: 'Up',
                  dn: 'Down'
                },
                cmd: {
                  cp: 'Copy',
                  del: 'Delete',
                  imp: 'Import',
                  exp: 'Export',
                  mod: 'Modify',
                  recovery: 'Recovery',
                  duplicate: 'Duplicate'
                }
              },
              menus: {
                home: 'Home',
                apps: 'Applications',
                subs: 'Subscriptions',
                profile: 'Profile'
              },
              apps: {
                fav: 'Favorites',
                unStar: 'Unstar',
                sysApps: 'System Applications'
              },
              appDetail: {
                scripts: 'Scripts',
                settings: 'Settings',
                curSession: 'Current Session',
                copyDatas: 'Copy Datas',
                clearDatas: 'Clear Datas',
                noDatas: 'No datas',
                impDialog: {
                  title: 'Import Session',
                  data: 'Session Data (JSON)',
                  dataDesc: 'You can get session data via `Current Session` more > Copy'
                }
              },
              subs: {
                addDialog: {
                  title: 'Add Subscription',
                  name: 'Session Name',
                  url: 'Subscription url',
                  urlDesc: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/chavy.boxjs.json'
                },

                sessionEditor: {
                  title: 'Modify Session',
                  name: 'Name',
                  nameDesc: 'Leave your name',
                  avatar: 'Avatar (Optional)',
                  avatarDesc: 'Your avatar link'
                },
                add: 'Add Subscription',
                subs: 'More Subscriptions',
                appSubs: 'App Subscriptions',
                errData: 'Error Data',
                updated: 'Updated',
                repo: 'Repository'
              },
              prefs: {
                appearance: 'Appearance',
                appearances: {
                  auto: 'Auto',
                  dark: 'Dark',
                  light: 'Light'
                },
                background: 'Background',
                icon: 'Dark icon',
                iconDesc: 'Available in dark mode',
                bgMode: 'Backgroud Mode',
                bgModeDesc: 'Hides bars & icons',
                hideTopBar: 'Hide TopBar',
                hideTopBarDesc: 'Restore via sidebar',
                autoTopBar: 'Auto TopBar',
                autoTopBarDesc: 'Hides when scrolling',
                hideBottomBar: 'Hide BottomBar',
                hideBottomBarDesc: 'Restore via sidebar',
                autoBottomBar: 'Auto BottomBar',
                autoBottomBarDesc: 'Hides when scrolling',
                muteMode: 'Do Not Disturb',
                muteModeDesc: 'Disable notifications',
                hideHelp: 'Hide Help',
                hideHelpDesc: 'Hides help button',
                hideBoxJs: 'Hide BoxJs',
                hideBoxJsDesc: 'Hides BoxJs button',
                hideProfileTitle: 'Hide Profile Title',
                hideProfileTitleDesc: 'Show avatar only',
                hideCodding: 'Hide Codding',
                hideCoddingDesc: 'Hides codding button',
                hideReload: 'Hide Reload',
                hideReloadDesc: 'Reload by double tap BoxJs',
                debugMode: 'Debug Mode',
                debugModeDesc: 'No page caches',
                debugPage: 'Debug Page Addr',
                debugPageDesc: 'Load page from...'
              },
              profile: {
                leaveName: 'Leave a name',
                dataviewer: 'Data Viewer',
                editor: {
                  title: 'Profile',
                  name: 'Name',
                  nameDesc: 'Leave your name',
                  avatar: 'Avatar (Optional)',
                  avatarDesc: 'Your avatar link'
                },
                impDialog: {
                  title: 'Import Backup',
                  impData: 'Backup Data',
                  impDataDesc: ''
                },
                datas: 'Datas',
                apps: 'Apps',
                subs: 'Subs',
                sessions: 'Sessions',
                imp: 'Import',
                bak: 'Backup',
                bakName: 'Global Backup'
              },
              bakDetail: {
                note: 'Note: ',
                id: 'Backup Index',
                name: 'Backup Name',
                title: 'Backup Informations',
                dataTitle: 'Backup Datas'
              },
              codding: {
                title: 'Script Editor'
              },
              viewer: {
                dataViewer: 'Data Viewer',
                dataKey: 'Data Key',
                dataKeyDesc: 'Input the data key',
                dataEditor: 'Data Editor',
                dataVal: 'Data Value'
              }
            },
            'zh-CN': {
              base: {
                dialog: {
                  apply: '应用',
                  save: '保存',
                  close: '关闭'
                },
                sort: {
                  up: '上移',
                  dn: '下移'
                },
                cmd: {
                  cp: '复制',
                  del: '删除',
                  imp: '导入',
                  mod: '修改',
                  recovery: '恢复',
                  duplicate: '克隆'
                }
              },
              menus: {
                home: '主页',
                apps: '应用',
                subs: '订阅',
                profile: '我的'
              },
              apps: {
                fav: '收藏应用',
                unStar: '取消收藏',
                sysApps: '内置应用'
              },
              appDetail: {
                scripts: '应用脚本',
                settings: '应用设置',
                curSession: '当前会话',
                copyDatas: '复制数据',
                clearDatas: '清除数据',
                noDatas: '无数据',
                impDialog: {
                  title: '导入会话',
                  data: '会话数据 (JSON)',
                  dataDesc: '你可通过 `当前会话` 更多 > 复制 来获得会话数据'
                }
              },
              subs: {
                addDialog: {
                  title: '添加订阅',
                  name: 'Session Name',
                  url: '订阅地址',
                  urlDesc: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/chavy.boxjs.json'
                },

                sessionEditor: {
                  title: '修改会话',
                  name: '会话名称'
                },
                add: '添加订阅',
                moreSubs: '更多订阅',
                appSubs: '应用订阅',
                errData: '格式错误',
                updated: '更新于',
                repo: '仓库'
              },
              prefs: {
                appearance: '外观',
                appearances: {
                  auto: '自动',
                  dark: '暗黑',
                  light: '明亮'
                },
                background: '背景图标',
                icon: '透明图标',
                iconDesc: '明亮主题下强制使用彩色图标',
                bgMode: '壁纸模式',
                bgModeDesc: '同时隐藏顶栏、底栏、图标',
                hideTopBar: '隐藏顶栏',
                hideTopBarDesc: '通过侧栏恢复',
                autoTopBar: '自动顶栏',
                autoTopBarDesc: '滚动时自动隐藏',
                hideBottomBar: '隐藏底栏',
                hideBottomBarDesc: '通过侧栏恢复',
                autoBottomBar: '自动底栏',
                autoBottomBarDesc: '滚动时自动隐藏',
                muteMode: '勿扰模式',
                muteModeDesc: '不发出通知 (仍记日志)',
                hideHelp: '隐藏帮助按钮',
                hideHelpDesc: '隐藏帮助按钮',
                hideBoxJs: '隐藏悬浮按钮',
                hideBoxJsDesc: '隐藏右下角 BoxJs 悬浮按钮',
                hideProfileTitle: '隐藏我的标题',
                hideProfileTitleDesc: '只显示头像',
                hideCodding: '隐藏编码按钮',
                hideCoddingDesc: 'Hides script editor entrance',
                hideReload: '隐藏刷新按钮',
                hideReloadDesc: '仍可双击悬浮按钮刷新页面',
                debugMode: '调试模式',
                debugModeDesc: '每次请求都获取最新的页面',
                debugPage: '调试页面地址',
                debugPageDesc: '页面源码的获取地址'
              },
              profile: {
                leaveName: '大侠, 请留名!',
                dataviewer: '数据查看器',
                editor: {
                  title: '个人资源',
                  name: '昵称',
                  nameDesc: '大侠, 请留名!',
                  avatar: '头像 (可选)',
                  avatarDesc: '头像链接, 建议从 Github 获取'
                },
                impDialog: {
                  title: 'Import Backup',
                  impData: 'Backup Data',
                  impDataDesc: ''
                },
                datas: '我的数据',
                apps: '应用',
                subs: '订阅',
                sessions: '会话',
                imp: '导入',
                bak: '备份',
                bakName: '全局备份'
              },
              bakDetail: {
                id: '备份索引',
                name: '备份名称',
                title: '备份信息',
                dataTitle: '备份数据'
              },
              codding: {
                title: '脚本编辑器'
              },
              viewer: {
                dataViewer: '数据查看器',
                dataKey: '数据键 (Key)',
                dataKeyDesc: '输入要查询的数据键, 如: boxjs_host',
                dataEditor: '数据编辑器',
                dataVal: '数据内容'
              }
            }
          }
        }),
        data() {
          return {
            ui: {
              // 请求类
              isCors: false, // 是否需要发起跨域请求
              // 路径类
              path: null,
              bfpath: null,
              view: null,
              bfview: null,
              subview: null,
              bfsubview: null,
              // 数据类
              collaborators: [],
              contributors: [],
              isSaveUserCfgs: false,
              // 界面类
              scrollY: {}, //记录每个界面的滚动值
              overlay: { show: false, val: 60 },
              snackbar: { show: false, color: 'primary', msg: '' },
              searchBar: {
                isActive: true,
                color: 'primary',
                class: 'rounded-xl',
                readonly: true,
                input: '',
                hideNoData: true,
                hideDetails: true,
                solo: true
              },
              viewer: {
                key: '',
                val: ''
              },
              searchDialog: { show: false },
              versionsheet: { show: false },
              updatesheet: { show: false },
              exeScriptSheet: { show: false, resp: null },
              naviDrawer: { show: false },
              modSessionDialog: { show: false },
              editProfileDialog: { show: false },
              impGlobalBakDialog: { show: false, impval: '' },
              impAppDatasDialog: { show: false, impval: '' },
              addAppSubDialog: { show: false, url: '' },
              defaultIcons: [
                'https://raw.githubusercontent.com/Orz-3/mini/master/appstore.png',
                'https://raw.githubusercontent.com/Orz-3/task/master/appstore.png'
              ]
            },
            boxServerData: null,
            box: null
          }
        },
        computed: {
          // 获取当前版本
          version() {
            return this.box.syscfgs.version
          },
          // 标题
          title() {
            const isDebugWeb = this.box.usercfgs.isDebugWeb
            const debugger_web = this.box.usercfgs.debugger_web
            const isDebugMode = this.box.syscfgs.isDebugMode
            return `BoxJs - v${this.version}${isDebugMode ? ` - ${debugger_web}` : ''}`
          },
          // 判断是否有新版本
          hasNewVersion() {
            const curver = this.box.syscfgs.version
            const vers = this.box.versions
            if (curver && vers && vers.length > 0) {
              const lastestVer = vers[0].version
              return this.compareVersion(lastestVer, curver) > 0
            }
          },
          timeagoLang() {
            const lang = this.box.usercfgs.lang
            return lang ? lang.replace('-', '_') : 'zh_CN'
          },
          // 判断是否需要跨域请求
          isCors() {
            return this.ui.isCors
          },
          // 是否加载中
          isLoading: {
            set(val) {
              this.ui.overlay.show = val
            },
            get() {
              return this.ui.overlay.show
            }
          },
          // 判断当前是否`WebApp`
          isWebApp() {
            return window.navigator.standalone
          },
          // 是否壁纸模式
          isWallpaperMode: {
            get() {
              return this.box.usercfgs.isWallpaperMode
            },
            set(val) {
              this.box.usercfgs.isWallpaperMode = val === true
            }
          },
          // 切换壁纸
          changeWallpaper() {
            if (this.isWallpaperMode) {
              if (this.box.usercfgs.changeBgImgEnterDefault) {
                const bgUrl = this.bgimgs.find((bgimg) => bgimg.name === this.box.usercfgs.changeBgImgEnterDefault).url
                if (bgUrl) {
                  this.box.usercfgs.bgimg = bgUrl
                  this.saveUserCfgs(false)
                }
              }
            } else {
              if (this.box.usercfgs.changeBgImgOutDefault) {
                const bgUrl = this.bgimgs.find((bgimg) => bgimg.name === this.box.usercfgs.changeBgImgOutDefault).url
                if (bgUrl || bgUrl === '') {
                  this.box.usercfgs.bgimg = bgUrl
                  this.saveUserCfgs(false)
                }
              }
            }
          },
          // 当前环境: Surge、QuanX、Loon、NodeJs
          env: {
            // 获取当前容器环境
            get() {
              return this.envs.find((env) => env.id === this.box.syscfgs.env)
            },
            // 设置当前容器环境
            set(val) {
              this.box.syscfgs.env = val
            }
          },
          // 获取容器列表
          envs() {
            const envs = this.box.syscfgs.envs
            envs.forEach((env) => (env.icon = env.icons[this.iconThemeIdx]))
            return envs
          },
          // 获取当前路径
          path: {
            get() {
              return this.ui.path
            },
            set(path) {
              this.ui.path = path
            }
          },
          // 获取上一个路径
          bfpath() {
            return this.ui.bfpath || ''
          },
          // 获取当前页面: http://boxjs.com/app/baidu => `app`
          view() {
            return this.ui.view || ''
          },
          // 获取当前页面: http://boxjs.com/app/baidu => `baidu`
          subview() {
            return this.ui.subview ? this.ui.subview : ''
          },
          // 判断当前是否`主页面` (非二级页面)
          isMainView() {
            return !this.subview
          },
          // 判断当前是否`暗黑模式`
          isDarkMode() {
            let isDark = true
            const theme = this.box.usercfgs.theme
            if (theme === 'auto') {
              isDark = this.isSystemDarkMode
            } else if (theme === 'light') {
              isDark = false
            }
            return isDark
          },
          // 判断系统是否`暗黑模式`
          isSystemDarkMode() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
          },
          // 是否透明图标
          isTransparentIcons() {
            return this.box.usercfgs.isTransparentIcons
          },
          // 获取图标下标, 透明: 0, 彩色: 1 (默认)
          iconThemeIdx() {
            if (this.isDarkMode) {
              return this.isTransparentIcons ? 0 : 1
            }
            return 1
          },
          // 获取环境图标下标, 透明: 0, 彩色: 1 (默认)
          iconEnvThemeIdx() {
            return this.isDarkMode ? 0 : 1
          },
          isHidedSearchBar: {
            get() {
              return this.box.usercfgs.isHidedSearchBar || this.isWallpaperMode
            },
            set(val) {
              this.box.usercfgs.isHidedSearchBar = val === true
            }
          },
          isAutoSearchBar: {
            get() {
              return this.box.usercfgs.isAutoSearchBar
            },
            set(val) {
              this.box.usercfgs.isAutoSearchBar = val === true
              if (val === false && !this.isHidedSearchBar) {
                this.$refs.appBar.isActive = true
              }
            }
          },
          isHidedAppIcons: {
            get() {
              return this.box.usercfgs.isHidedAppIcons || this.isWallpaperMode
            },
            set(val) {
              this.box.usercfgs.isHidedAppIcons = val === true
            }
          },
          isHidedNaviBottom: {
            get() {
              return this.box.usercfgs.isHidedNaviBottom || this.isWallpaperMode
            },
            set(val) {
              this.box.usercfgs.isHidedNaviBottom = val === true
            }
          },
          isAutoNaviBottom: {
            get() {
              return this.box.usercfgs.isAutoNaviBottom
            },
            set(val) {
              this.box.usercfgs.isAutoNaviBottom = val === true
              if (val === false && !this.isHidedNaviBottom) {
                this.$refs.naviBar.isActive = true
              }
            }
          },
          // 判断是否有壁纸
          isWallpaper() {
            return !!this.box.usercfgs.bgimg
          },
          // 是否存在多张壁纸
          isMutiWallpaper() {
            return this.bgimgs && this.bgimgs.length > 2
          },
          // 背景图片列表
          bgimgs() {
            const items = []
            const bgimgs = this.box.usercfgs.bgimgs
            if (bgimgs) {
              bgimgs.split('\n').forEach((img) => {
                const [name, url] = img.split(',')
                items.push({ name, url })
              })
            }
            return items
          },
          // 样式
          appViewStyle() {
            // 主题发生变化时给 
      <body> 设置背景色
            if (this.isWallpaper) {
              this.setWallpaper()
            } else {
              this.clearWallpaper()
              const darkBg = `background: #121212;`
              const lightWebappBg = `background-image: linear-gradient(to bottom,rgba(0,0,0,.2) 0,transparent 76px);`
              const lightBg = `${this.isWebApp ? lightWebappBg : 'background: #fff;'}`
              document.querySelector('#BG').setAttribute('style', this.isDarkMode ? darkBg : lightBg)
            }
            if (this.isWebApp) {
              return { background: 'none' }
            } else if (this.isWallpaper && !this.isTransparent) {
              return { background: 'transparent' }
            } else if (!this.isWallpaper && this.isTransparent) {
              return { background: 'none' }
            } else {
              return
            }
          },
          appTitleStyle() {
            const style = {}
            if (this.isWallpaper) {
              style['color'] = '#fff'
              style['text-shadow'] = 'black 0.1em 0.1em 0.2em'
            }
            return style
          },
          appBarBind() {
            const app = true
            const isEmptyLight = this.isWebApp && !this.isDarkMode && !this.isWallpaper
            const color = isEmptyLight ? 'primary' : 'transparent'
            const flat = color === 'transparent'
            const hideOnScroll = !this.isHidedSearchBar && this.isAutoSearchBar
            const collapseOnScroll = false
            const scrollThreshold = 20
            return { app, color, flat, hideOnScroll, collapseOnScroll, scrollThreshold }
          },
          searchBarBind() {
            const color = this.isDarkMode ? null : 'primary'
            return { color }
          },
          naviBarBind() {
            const app = true
            const grow = true
            const color = 'primary'
            const value = this.view
            const inputValue = !this.isHidedNaviBottom
            const hideOnScroll = !this.isHidedNaviBottom && this.isAutoNaviBottom
            const scrollThreshold = 160
            return { app, grow, color, value, inputValue, hideOnScroll, scrollThreshold }
          },
          appIconFontStyle() {
            const style = {
              'font-size': '10px',
              'max-width': '54px'
            }

            if (this.isWallpaper) {
              style['color'] = '#fff'
              style['text-shadow'] = 'black 0.1em 0.1em 0.2em'
            }
            return style
          },
          // 是否保存用户偏好
          isSaveUserCfgs: {
            set(val) {
              this.ui.isSaveUserCfgs = val
            },
            get() {
              return this.ui.isSaveUserCfgs
            }
          },
          // 我的图标
          myIcon() {
            return this.box.usercfgs.icon
          },
          // 是否隐藏`我的`标题
          isHideMyTitle() {
            return this.box.usercfgs.isHideMyTitle
          },
          // 添加`应用订阅`对话框
          addAppSubDialog: {
            get() {
              return this.ui.addAppSubDialog.show
            },
            set(show) {
              this.ui.addAppSubDialog.show = show
            }
          },
          // 获取持久化数据
          datas() {
            return this.box.datas
          },
          // 应用会话数据
          sessions() {
            return this.box.sessions
          },
          // 获取`收藏`应用
          favApps() {
            const favapps = []
            const favAppIds = this.box.usercfgs.favapps || []
            if (favAppIds) {
              favAppIds.forEach((favAppId) => {
                const app = this.apps.find((app) => app.id === favAppId)
                if (app) {
                  favapps.push(app)
                }
              })
            }
            return favapps
          },
          // 获取`内置`应用
          sysApps() {
            const sysapps = this.box.sysapps || []
            sysapps.forEach((app) => this.loadAppBaseInfo(app))
            sysapps.sort((a, b) => a.name.localeCompare(b.name))
            return sysapps
          },
          // 获取`订阅`应用 (注意: 这个接口是获取`应用`)
          subApps() {
            const apps = []
            this.appSubs.forEach((appsub) => {
              const sub = this.appSubCaches[appsub.url]
              if (sub && sub.apps && Array.isArray(sub.apps) && !appsub.isErr) {
                sub.apps.forEach((app) => {
                  this.loadAppBaseInfo(app)
                  apps.push(app)
                })
              }
            })
            return apps
          },
          // 获取`应用`订阅 (注意: 这个接口是获取`订阅`)
          appSubs() {
            // 深拷贝一份数据, 避免污染`usercfgs`
            const subs = JSON.parse(JSON.stringify(this.box.usercfgs.appsubs))
            subs.forEach((sub) => {
              const cacheSub = this.appSubCaches[sub.url]
              const isValidSub = cacheSub && Array.isArray(cacheSub.apps) && cacheSub.apps.length > 0
              const isValidSubApps = isValidSub && !cacheSub.apps.find((app) => !app.id)
              if (cacheSub && isValidSub && isValidSubApps) {
                Object.assign(sub, cacheSub)
              } else {
                sub.isErr = true
                sub.apps = []
              }
              sub.name = sub.name ? sub.name : '匿名订阅'
              sub.author = sub.author ? sub.author : '@anonymous'
              sub.repo = sub.repo ? sub.repo : sub.url
            })
            return subs
          },
          // 获取`订阅`缓存
          appSubCaches() {
            return this.box.appSubCaches
          },
          // 获取所有应用`内置应用`+`订阅应用`
          apps() {
            const apps = []
            apps.push(...this.subApps)
            apps.push(...this.sysApps)
            return apps
          },
          searchApps() {
            return this.apps.filter((app) => app.id.includes(this.ui.searchBar.input) || app.name.includes(this.ui.searchBar.input))
          },
          // 获取全局备份
          baks() {
            return this.box.globalbaks
          },
          // 当前应用
          curapp() {
            if (this.view === 'app' && !!this.subview) {
              const appId = decodeURIComponent(decodeURIComponent(this.subview))
              const app = this.apps.find((app) => app.id === appId)
              this.loadAppDataInfo(app)
              return app
            }
          },
          // 当前备份
          curbak() {
            if (this.view === 'bak' && !!this.subview) {
              const bakId = decodeURIComponent(decodeURIComponent(this.subview))
              const bak = this.baks.find((bak) => bak.id === bakId)
              return bak
            }
          }
        },
        watch: {
          'ui.path': {
            handler(newval, oldval) {
              if (/^\/#/.test(newval)) {
                newval = newval.replace('/#', '')
              }
              const [, view, subview] = newval.split('/')

              this.ui.view = view
              this.ui.subview = subview
              if (oldval) {
                const [, bfview, bfsubview] = oldval.split('/')
                this.ui.bfpath = oldval
                this.ui.bfview = bfview
                this.ui.bfsubview = bfsubview
              }
              if (newval === '/coding') {
                require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/min/vs' } })
                require(['vs/editor/editor.main'], () => {
                  const envjs_demo = [
                    '/** ',
                    ' * 注意: ',
                    ' * 在这里你可以使用完整的 EnvJs 环境',
                    ' * ',
                    ' * 同时: ',
                    ' * 你`必须`手动调用 $done()',
                    ' * ',
                    ' * 因为: ',
                    ' * BoxJs 不为主动执行的脚本调用 $done()',
                    ' * 而把 $done 的时机完全交由脚本控制',
                    ' * ',
                    ' * 最后: ',
                    ' * 这段脚本是可以直接运行的!',
                    ' */ ',
                    'const host = $.getdata("boxjs_host")',
                    'console.log("输出的内容是返回给浏览器的!")',
                    '$.msg($.name, host)',
                    '$.done()',
                    '// $done() 或 $.done() 都可以'
                  ]
                  const surgejs_demo = [
                    '/** ',
                    ' * 注意: ',
                    ' * 你正在使用 Surge HTTP-API 环境',
                    ' * ',
                    ' * 在这里：你不可以使用 EnvJs',
                    ' * 请确保：你的脚本能被 Surge 独立运行',
                    ' * ',
                    ' * 最后: ',
                    ' * 这段脚本是可以直接运行的!',
                    ' */ ',
                    'const host = $persistentStore.read("boxjs_host")',
                    'const msgs = [""]',
                    '',
                    'msgs.push("这是日志的内容")',
                    'msgs.push("BoxJs host: " + host)',
                    '',
                    'console.log(msgs.join("\\n"))',
                    '$done()'
                  ]
                  this.ui.editor = monaco.editor.create(document.getElementById('container'), {
                    fontSize: 12,
                    tabSize: 2,
                    value: this.env.id === 'Surge' && this.box.usercfgs.httpapi ? surgejs_demo.join('\n') : envjs_demo.join('\n'),
                    language: 'javascript',
                    minimap: { enabled: false },
                    theme: this.isDarkMode ? 'vs-dark' : 'vs'
                  })
                })
              }
              window.onresize = () => {
                if (this.ui.editor) {
                  this.ui.editor.layout()
                }
              }
              // 还原视图当时的滚动值
              const scrollY = this.ui.scrollY[this.path] || 0
              const offsetTop = -this.$vuetify.application.top
              this.$vuetify.goTo(scrollY, { duration: 0, offset: offsetTop })
            }
          },
          'ui.searchDialog.show': {
            handler(newval) {
              if (newval === false) {
                this.ui.searchBar.input = ''
              } else {
                if (this.$refs.search) {
                  this.$nextTick(() => {
                    setTimeout(() => this.$refs.search.$refs.input.focus(), 0)
                  })
                }
              }
            }
          },
          'ui.naviDrawer.show': {
            handler(newval, oldval) {
              // 获取贡献者列表
              if (_.isEmpty(this.ui.contributors)) {
                this.getContributors()
              }
            }
          },
          'box.usercfgs': {
            deep: true,
            handler(newval, oldval) {
              if (oldval && this.isSaveUserCfgs) {
                this.saveUserCfgs()
              }
              this.isSaveUserCfgs = true
            }
          },
          'box.usercfgs.lang': {
            handler(newval) {
              this.$i18n.locale = newval
            }
          },
          'box.usercfgs.theme': {
            handler() {
              if (this.ui.editor) {
                this.ui.editor._themeService.setTheme(this.isDarkMode ? 'vs-dark' : 'vs')
              }
            }
          },
          'box.usercfgs.color_dark_primary': {
            handler() {
              this.loadTheme()
            }
          },
          'box.usercfgs.color_light_primary': {
            handler() {
              this.loadTheme()
            }
          }
        },
        beforeCreate() {
          // 请求&响应拦截器, 显示&隐藏加载条
          axios.interceptors.request.use((cfg) => {
            this.isLoading = true
            return cfg
          })
          axios.interceptors.response.use(
            (resp) => {
              this.isLoading = false
              return resp
            },
            (error) => (this.isLoading = false)
          )
        },
        created() {
          // 如果 url 参数中指定的 baseURL, 则后续的请求都请求到指定的域
          if (window.location.search) {
            const [, baseURL] = /baseURL=(.*?)(&|$)/.exec(window.location.search)
            axios.defaults.baseURL = baseURL || ''
            this.ui.isCors = true
          }
          // 根据路径跳转视图
          const defview = '/'
          if (!this.isCors) {
            let path = location.pathname + location.hash
            this.path = path === '/' ? defview : path
          } else {
            this.path = defview
          }
          // 监听浏览器后退事件
          window.addEventListener('popstate', (e) => (this.path = e.state.url), false)
          // 如果后端没有渲染数据, 则发出请求获取数据
          if (this.boxServerData) {
            this.box = this.boxServerData
            this.setHttpBackend()
          } else {
            axios.get('/query/boxdata').then((resp) => {
              this.box = resp.data
              this.setHttpBackend()
            })
          }

          // 延时执行, 避免多个请求抢占资源
          setTimeout(this.getVersions, 3000)
          this.loadTheme()
        },
        mounted() {
          const el = document.getElementById('appList')
          const _this = this
          const sortable = Sortable.create(el, {
            animation: 600,
            delay: 200,
            onEnd(evt) {
              const favApps = _this.box.usercfgs.favapps
              const oldIdx = evt.oldIndex
              const newIdx = evt.newIndex
              const moveItem = favApps[oldIdx]
              favApps.splice(oldIdx, 1)
              favApps.splice(newIdx, 0, moveItem)
            }
          })

          if (!this.box.usercfgs.lang) {
            const locale = this.$i18n.locale
            this.box.usercfgs.lang = locale === 'zh-CN' ? locale : 'en-US'
            this.saveUserCfgs()
          } else {
            this.$i18n.locale = this.box.usercfgs.lang
          }

          if (this.path.includes('/#/bak/')) {
            const [, backupId] = this.path.split('/#/bak/')
            this.loadGlobalBak(backupId)
          }
        },
        methods: {
          reload() {
            this.isLoading = true
            window.location.reload()
          },
          open(url) {
            window.open(url)
          },
          // 记录每个页面的滚动值
          onScroll(event) {
            const currentY = event.currentTarget.scrollY
            const historyY = this.ui.scrollY[this.path]
            this.ui.scrollY[this.path] = event.currentTarget.scrollY
            // 下拉显示/隐藏顶栏
            // 回弹时才触发显示与隐藏, 1 秒内不重复触发
            if (currentY < historyY && currentY < -80 && !this.ui.isWaitToggleSearchBar) {
              // 壁纸模式: 取消模式模式
              if (this.isWallpaperMode) {
                this.isWallpaperMode = false
              }
              // 非壁纸模式: 显示&隐藏顶栏
              else {
                this.ui.isWaitToggleSearchBar = true
                this.isHidedSearchBar = !this.isHidedSearchBar
                this.toggleWaitSearchBar()
              }
            }
          },
          setWallpaper() {
            let bgimg = ''
            if (this.box.usercfgs.bgimg === '跟随系统') {
              const hasdark = this.bgimgs.find((bgimg) => bgimg.name == '暗黑' || bgimg.name == 'dark')
              const haslight = this.bgimgs.find((bgimg) => bgimg.name == '明亮' || bgimg.name == 'light')
              const darkbgimg = hasdark ? hasdark.url : ``
              const lightbgimg = haslight ? haslight.url : ``
              this.isDarkMode ? (bgimg = darkbgimg) : (bgimg = lightbgimg)
              const bgStyle = [
                `background-image: linear-gradient(to bottom,rgba(0,0,0,.2) 0,transparent 76px), url(${bgimg}?_=${Math.random()})`
              ]
              document.querySelector('#BG').setAttribute('style', bgStyle.join('; '))
            } else {
              const bgStyle = [
                `background-image: linear-gradient(to bottom,rgba(0,0,0,.2) 0,transparent 76px), url(${
                  this.box.usercfgs.bgimg
                }?_=${Math.random()})`
              ]
              document.querySelector('#BG').setAttribute('style', bgStyle.join('; '))
            }
          },
          clearWallpaper() {
            document.querySelector('#BG').removeAttribute('style')
          },
          toggleWaitSearchBar: _.debounce(function () {
            this.ui.isWaitToggleSearchBar = false
          }, 1000),
          handleHistory(path) {
            const { hash } = window.location.href
            const state = { title: 'BoxJs', url: '/' + (hash ? hash : '#/') }
            if (!history.state) {
              history.replaceState(state, '')
            }
            state.url = path
            history.pushState(state, '', path)
          },
          // 页面返回
          back() {
            history.back()
          },
          // 切换当前容器环境
          switchEnv(env) {
            this.env = env
          },
          // 切换当前视图
          switchView(path) {
            path = `/#/${path}`
            if (this.path !== path) {
              this.path = path
              this.handleHistory(this.path)
            } else {
              const scrollY = this.ui.scrollY[this.path]
              const isTopY = _.isNil(scrollY) || scrollY === 0
              if (path === '/#/' && isTopY) {
                this.clearWallpaper()
                this.setWallpaper()
              } else if (path === '/#/app' && isTopY) {
                Object.assign(this.box.usercfgs, { favapppanel: [], subapppanel: [], sysapppanel: [] })
              } else if (path === '/#/sub' && isTopY) {
                this.reloadAppSub()
              }
              if (this.ui.scrollY[path] !== 0) {
                this.$vuetify.goTo(0, { duration: 200, offset: 0 })
              }
            }
          },
          // 切换应用视图
          switchAppView(appId) {
            const path = `/#/app/${appId}`
            this.path = path
            this.handleHistory(this.path)
          },
          // 切换备份视图
          switchBakView(backupId) {
            const path = `/#/bak/${backupId}`
            this.loadGlobalBak(backupId).then((resp) => {
              this.path = path
              this.handleHistory(path)
            })
          },
          // 重载主题
          loadTheme() {
            this.$vuetify.theme.dark = this.isDarkMode
            this.$vuetify.theme.themes.light.primary = this.box.usercfgs.color_light_primary || '#F7BB0E'
            this.$vuetify.theme.themes.dark.primary = this.box.usercfgs.color_dark_primary || '#2196F3'
          },
          // 复制文本
          copy(str) {
            this.$copyText(str).then(
              (e) => {
                this.ui.snackbar.show = true
                this.ui.snackbar.msg = '复制成功!'
                this.ui.snackbar.color = 'primary'
              },
              (e) => {
                this.ui.snackbar.show = true
                this.ui.snackbar.msg = '复制失败!'
                this.ui.snackbar.color = 'error'
              }
            )
          },
          // 移动收藏
          moveFav(favIdx, moveCnt) {
            const favapps = this.box.usercfgs.favapps
            const fromIdx = favIdx
            const toIdx = favIdx + moveCnt
            favapps.splice(fromIdx, 1, ...favapps.splice(toIdx, 1, favapps[fromIdx]))
          },
          // 移动订阅
          moveSub(subIdx, moveCnt) {
            const appsubs = this.box.usercfgs.appsubs
            const fromIdx = subIdx
            const toIdx = subIdx + moveCnt
            appsubs.splice(fromIdx, 1, ...appsubs.splice(toIdx, 1, appsubs[fromIdx]))
          },
          // 删除订阅
          delSub(subIdx) {
            this.box.usercfgs.appsubs.splice(subIdx, 1)
          },
          // 收藏应用
          favApp(appId) {
            const favAppIdx = this.box.usercfgs.favapps.findIndex((favAppId) => favAppId === appId)
            if (favAppIdx === -1) {
              this.box.usercfgs.favapps.push(appId)
            } else {
              this.box.usercfgs.favapps.splice(favAppIdx, 1)
            }
          },
          // 加载应用信息
          loadAppBaseInfo(app) {
            // 应用图标
            app.icons = Array.isArray(app.icons) ? app.icons : this.ui.defaultIcons
            const isBrokenIcons = app.icons.find((i) => i.includes('/Orz-3/task/master/'))
            if (isBrokenIcons) {
              app.icons[0] = app.icons[0].replace('/Orz-3/mini/master/', '/Orz-3/mini/master/Alpha/')
              app.icons[1] = app.icons[1].replace('/Orz-3/task/master/', '/Orz-3/mini/master/Color/')
            }
            app.icon = app.icons[this.iconThemeIdx]

            // 是否收藏
            const isFav = this.box.usercfgs.favapps.includes(app.id)
            app.favIcon = isFav ? 'mdi-star' : 'mdi-star-outline'
            app.favIconColor = isFav ? 'primary' : 'grey'
          },
          // 加载应用数据
          loadAppDataInfo(app) {
            if (app.isLoaded) return
            // 加载应用设置
            if (app.settings) {
              app.settings.forEach((setting) => {
                const key = setting.id
                const datval = this.datas[key]
                if (setting.type === 'boolean') {
                  setting.val = datval === null ? setting.val : datval === 'true'
                } else if (setting.type === 'int') {
                  setting.val = datval * 1 || setting.val
                } else if (setting.type === 'checkboxes') {
                  if (!_.isNil(datval)) {
                    setting.val = datval ? datval.split(',') : []
                  }
                } else {
                  setting.val = datval || setting.val
                }
              })
            }
            // 加载当前会话数据
            if (app.keys) {
              app.datas = []
              app.keys.forEach((key) => {
                const val = this.datas[key] || ''
                app.datas.push({ key, val })
              })
            }
            // 加载会话列表
            const sessions = this.sessions.filter((session) => session.appId === app.id)
            app.sessions = sessions || []

            // 加载当前切换会话
            const curSessionId = this.box.curSessions[app.id]
            if (curSessionId) {
              const curSession = this.sessions.find((session) => session.id === curSessionId)
              app.curSession = curSession
            }
            app.isLoaded = true
          },
          // 运行远程脚本
          runRemoteScript(url, timeout) {
            const opts = { url, timeout, isRemote: true }
            this.runScript(opts)
          },
          // 运行文本脚本
          runTxtScript() {
            const script = this.ui.editor.getValue()
            const opts = { script }
            this.runScript(opts)
          },
          runScript(opts) {
            axios.post('/api/runScript', opts).then((resp) => {
              if (!this.box.usercfgs.isMute) {
                this.ui.exeScriptSheet.resp = resp.data
                this.ui.exeScriptSheet.show = true
              }
            })
          },
          // 保存用户偏好
          saveUserCfgs() {
            const key = 'chavy_boxjs_userCfgs'
            const val = JSON.stringify(this.box.usercfgs)
            axios.post('/api/save', [{ key, val }]).then((resp) => {
              this.loadTheme()
            })
          },
          // 保存应用设置
          saveAppSettings() {
            const datas = []
            this.curapp.settings.forEach((setting) => {
              const isNilVal = _.isNil(setting.val)
              const key = setting.id
              const val = !isNilVal ? _.toString(setting.val) : ''
              datas.push({ key, val })
            })
            axios.post('/api/save', datas).then((resp) => {
              if (this.curapp.id === 'BoxSetting') {
                this.isSaveUserCfgs = false
              } else {
                delete resp.data.usercfgs
              }
              Object.assign(this.box, resp.data)

              if (this.curapp.id === 'BoxSetting') {
                this.setHttpBackend()
              }
            })
          },
          // 保存应用会话
          saveAppSession() {
            const session = {
              id: uuidv4(),
              name: '会话 ' + (this.curapp.sessions.length + 1),
              appId: this.curapp.id,
              appName: this.curapp.name,
              enable: true,
              createTime: new Date(),
              datas: this.curapp.datas
            }
            this.box.sessions.push(session)
            const key = 'chavy_boxjs_sessions'
            const val = JSON.stringify(this.box.sessions)
            axios.post('/api/save', [{ key, val }]).then((resp) => {
              delete resp.data.usercfgs
              Object.assign(this.box, resp.data)
            })
          },
          // 修改应用会话
          updateAppSession(session) {
            session.datas.forEach((dat) => {
              // 如果属性值是 undefined 或 null, 则修改为 ``, 否则转为字符串
              dat.val = !_.isNil(dat.val) ? _.toString(dat.val) : ''
            })
            const key = 'chavy_boxjs_sessions'
            const val = JSON.stringify(this.box.sessions)
            axios
              .post('/api/save', [{ key, val }])
              .then((resp) => {
                delete resp.data.usercfgs
                Object.assign(this.box, resp.data)
              })
              .finally(() => (this.ui.modSessionDialog.show = false))
          },
          // 删除应用会话
          delAppSession(sessionId) {
            const sessions = this.box.sessions
            const sessionIdx = sessions.findIndex((session) => session.id === sessionId)
            sessions.splice(sessionIdx, 1)
            const key = 'chavy_boxjs_sessions'
            const val = JSON.stringify(this.box.sessions)
            axios.post('/api/save', [{ key, val }]).then((resp) => {
              delete resp.data.usercfgs
              Object.assign(this.box, resp.data)
            })
          },
          // 使用应用会话
          useAppSession(sessionId) {
            const sessions = this.box.sessions
            const session = sessions.find((session) => session.id === sessionId)
            this.box.curSessions[session.appId] = sessionId

            const key = 'chavy_boxjs_cur_sessions'
            const val = JSON.stringify(this.box.curSessions)
            const curSessions = [{ key, val }]
            const datas = [...session.datas, ...curSessions]

            this.clearAppDatas()
            axios.post('/api/save', datas).then((resp) => {
              delete resp.data.usercfgs
              Object.assign(this.box, resp.data)
            })
          },
          // 复制应用数据为对象数据
          copyData(curdata) {
            const datas = curdata.datas
            let result = {}
            datas.forEach(({ key, val }) => {
              result[key] = val
            })
            this.copy(JSON.stringify(result))
          },
          // 保存应用数据
          clearAppDatas(key) {
            const datas = this.curapp.datas
            if (key) {
              const data = datas.find((data) => data.key === key)
              data.val = ''
            } else {
              datas.forEach((data) => (data.val = ''))
            }
            axios.post('/api/save', datas).then((resp) => {
              if (this.curapp.id === 'BoxSetting') {
                this.isSaveUserCfgs = false
              } else {
                delete resp.data.usercfgs
              }
              Object.assign(this.box, resp.data)
            })
          },
          // 导入应用数据
          impAppDatas() {
            const impval = this.ui.impAppDatasDialog.impval
            const impapp = JSON.parse(impval)
            const datas = impapp.datas || []
            const settings = impapp.settings || []
            settings.forEach((setting) => {
              const { id: key, val } = setting
              datas.push({ key, val })
            })
            axios
              .post('/api/save', datas)
              .then((resp) => {
                delete resp.data.usercfgs
                Object.assign(this.box, resp.data)
              })
              .finally(() => {
                this.ui.impAppDatasDialog.show = false
                this.ui.impAppDatasDialog.impval = ''
              })
          },
          // 添加应用订阅
          addAppSub(url) {
            const sub = { d: uuidv4(), url, enable: true }
            axios
              .post('/api/addAppSub', sub)
              .then((resp) => {
                this.isSaveUserCfgs = false
                Object.assign(this.box, resp.data)
              })
              .finally(() => (this.addAppSubDialog = false))
          },
          // 重载应用订阅
          reloadAppSub(sub) {
            axios.post('/api/reloadAppSub', sub).then((resp) => {
              delete resp.data.usercfgs
              Object.assign(this.box, resp.data)
            })
          },
          // 加载完整的全局备份 (页面渲染时加载只是备份列表)
          loadGlobalBak(backupId) {
            return axios.get(`/query/baks/${backupId}`).then((resp) => {
              const backup = this.box.globalbaks.find((backup) => backup.id === backupId)
              backup.bak = resp.data
            })
          },
          // 删除全局备份
          delGlobalBak() {
            const { id } = this.curbak
            axios.post('/api/delGlobalBak', { id }).then((resp) => {
              this.back()
              delete resp.data.usercfgs
              Object.assign(this.box, resp.data)
            })
          },
          // 保存当前备份
          updateGlobalBak() {
            const { id, name } = this.curbak
            axios.post('/api/updateGlobalBak', { id, name }).then((resp) => {
              delete resp.data.usercfgs
              Object.assign(this.box, resp.data)
            })
          },
          // 导入全局备份
          impGlobalBak() {
            const impval = this.ui.impGlobalBakDialog.impval
            const bak = {
              id: uuidv4(),
              name: `${this.$t('profile.bakName')} ` + (this.box.globalbaks.length + 1),
              env: this.box.syscfgs.env,
              version: this.box.syscfgs.version,
              versionType: this.box.syscfgs.versionType,
              createTime: new Date(),
              bak: JSON.parse(impval)
            }
            bak.tags = [bak.env, bak.version, bak.versionType]
            axios
              .post('/api/impGlobalBak', bak)
              .then((resp) => {
                delete resp.data.usercfgs
                Object.assign(this.box, resp.data)
              })
              .finally(() => {
                this.ui.impGlobalBakDialog.impval = ''
                this.ui.impGlobalBakDialog.show = false
              })
          },
          // 保存备份
          saveGlobalBak() {
            const bak = {
              id: uuidv4(),
              name: `${this.$t('profile.bakName')} ` + (this.box.globalbaks.length + 1),
              env: this.box.syscfgs.env,
              version: this.box.syscfgs.version,
              versionType: this.box.syscfgs.versionType,
              createTime: new Date()
            }
            bak.tags = [bak.env, bak.version, bak.versionType]
            axios.post('/api/saveGlobalBak', bak).then((resp) => {
              delete resp.data.usercfgs
              Object.assign(this.box, resp.data)
            })
          },
          // 还原备份
          revertGlobalBak() {
            const { id } = this.curbak
            axios
              .post('/api/revertGlobalBak', { id })
              .then((resp) => {
                this.isSaveUserCfgs = false
                Object.assign(this.box, resp.data)
              })
              .finally(() => this.loadTheme())
          },
          // 获取仓库贡献者
          getContributors() {
            const url = 'https://api.github.com/repos/chavyleung/scripts/contributors'
            axios.get(url).then((resp) => {
              if (!resp) return
              resp.data.forEach((contributor) => {
                const { login: id, login, html_url: repo, avatar_url: icon } = contributor
                if ([29748519, 39037656, 9592236].includes(contributor.id)) {
                  this.ui.collaborators.push({ id, login, repo, icon })
                } else {
                  this.ui.contributors.push({ id, login, repo, icon })
                }
              })
            })
          },
          // 获取版本清单
          getVersions() {
            axios.get('/query/versions').then((resp) => {
              if (resp.data && resp.data.releases) {
                Object.assign(this.box, { versions: resp.data.releases })
                if (this.hasNewVersion) {
                  this.ui.versionsheet.show = true
                }
              }
            })
          },
          // 查询数据
          queryData() {
            const key = this.ui.viewer.key
            this.ui.viewer.key = key ? key : 'boxjs_host'
            axios.get(`/query/data/${this.ui.viewer.key}`).then((resp) => {
              this.ui.viewer.val = resp.data.val
              this.box.usercfgs.viewkeys.unshift(this.ui.viewer.key)
            })
          },
          saveData() {
            const key = this.ui.viewer.key
            const val = this.ui.viewer.val
            if (key) {
              axios.post('/api/saveData/', { key, val }).then((resp) => {
                this.ui.viewer.val = resp.data.val
              })
            }
          },
          // 对比版本号
          compareVersion(v1, v2) {
            var _v1 = v1.split('.'),
              _v2 = v2.split('.'),
              _r = _v1[0] - _v2[0]
            return _r == 0 && v1 != v2 ? this.compareVersion(_v1.splice(1).join('.'), _v2.splice(1).join('.')) : _r
          },
          // 设置HTTP Backend
          setHttpBackend() {
            // 目前HTTP Backend不能修改端口号
            var regex = /^http:\/\/(.*):9999$/
            if (this.box.syscfgs.env === 'QuanX') {
              if (regex.test(window.location.origin)) {
                axios.defaults.baseURL = ''
                return
              }
              // 如果是Quantumult X环境并且配置了正确格式的HTTP Backend，将axios请求指向到HTTP Backend
              if (this.box.usercfgs.http_backend && regex.test(this.box.usercfgs.http_backend)) {
                axios.defaults.baseURL = this.box.usercfgs.http_backend
                this.ui.isCors = true
              } else {
                axios.defaults.baseURL = ''
              }
            }
          }
        }
      })
    
      </script>
    </body>
  </html>
