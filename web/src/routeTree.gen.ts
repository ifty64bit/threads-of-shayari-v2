/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as RegisterRouteImport } from './routes/register'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AuthRouteRouteImport } from './routes/_auth/route'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthProfileRouteImport } from './routes/_auth/profile'
import { Route as AuthFeedRouteImport } from './routes/_auth/feed'
import { Route as AuthUsernameIndexRouteImport } from './routes/_auth/$username/index'
import { Route as AuthUsernamePostIdRouteImport } from './routes/_auth/$username/$postId'

const RegisterRoute = RegisterRouteImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthRouteRoute = AuthRouteRouteImport.update({
  id: '/_auth',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthProfileRoute = AuthProfileRouteImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthFeedRoute = AuthFeedRouteImport.update({
  id: '/feed',
  path: '/feed',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthUsernameIndexRoute = AuthUsernameIndexRouteImport.update({
  id: '/$username/',
  path: '/$username/',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthUsernamePostIdRoute = AuthUsernamePostIdRouteImport.update({
  id: '/$username/$postId',
  path: '/$username/$postId',
  getParentRoute: () => AuthRouteRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/feed': typeof AuthFeedRoute
  '/profile': typeof AuthProfileRoute
  '/$username/$postId': typeof AuthUsernamePostIdRoute
  '/$username': typeof AuthUsernameIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/feed': typeof AuthFeedRoute
  '/profile': typeof AuthProfileRoute
  '/$username/$postId': typeof AuthUsernamePostIdRoute
  '/$username': typeof AuthUsernameIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/_auth': typeof AuthRouteRouteWithChildren
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/_auth/feed': typeof AuthFeedRoute
  '/_auth/profile': typeof AuthProfileRoute
  '/_auth/$username/$postId': typeof AuthUsernamePostIdRoute
  '/_auth/$username/': typeof AuthUsernameIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/login'
    | '/register'
    | '/feed'
    | '/profile'
    | '/$username/$postId'
    | '/$username'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/login'
    | '/register'
    | '/feed'
    | '/profile'
    | '/$username/$postId'
    | '/$username'
  id:
    | '__root__'
    | '/'
    | '/_auth'
    | '/login'
    | '/register'
    | '/_auth/feed'
    | '/_auth/profile'
    | '/_auth/$username/$postId'
    | '/_auth/$username/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthRouteRoute: typeof AuthRouteRouteWithChildren
  LoginRoute: typeof LoginRoute
  RegisterRoute: typeof RegisterRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_auth': {
      id: '/_auth'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_auth/profile': {
      id: '/_auth/profile'
      path: '/profile'
      fullPath: '/profile'
      preLoaderRoute: typeof AuthProfileRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_auth/feed': {
      id: '/_auth/feed'
      path: '/feed'
      fullPath: '/feed'
      preLoaderRoute: typeof AuthFeedRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_auth/$username/': {
      id: '/_auth/$username/'
      path: '/$username'
      fullPath: '/$username'
      preLoaderRoute: typeof AuthUsernameIndexRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_auth/$username/$postId': {
      id: '/_auth/$username/$postId'
      path: '/$username/$postId'
      fullPath: '/$username/$postId'
      preLoaderRoute: typeof AuthUsernamePostIdRouteImport
      parentRoute: typeof AuthRouteRoute
    }
  }
}

interface AuthRouteRouteChildren {
  AuthFeedRoute: typeof AuthFeedRoute
  AuthProfileRoute: typeof AuthProfileRoute
  AuthUsernamePostIdRoute: typeof AuthUsernamePostIdRoute
  AuthUsernameIndexRoute: typeof AuthUsernameIndexRoute
}

const AuthRouteRouteChildren: AuthRouteRouteChildren = {
  AuthFeedRoute: AuthFeedRoute,
  AuthProfileRoute: AuthProfileRoute,
  AuthUsernamePostIdRoute: AuthUsernamePostIdRoute,
  AuthUsernameIndexRoute: AuthUsernameIndexRoute,
}

const AuthRouteRouteWithChildren = AuthRouteRoute._addFileChildren(
  AuthRouteRouteChildren,
)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthRouteRoute: AuthRouteRouteWithChildren,
  LoginRoute: LoginRoute,
  RegisterRoute: RegisterRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
