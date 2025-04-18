from pathlib import Path
from msal import ConfidentialClientApplication
import os
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-&16^$a#jo(dst447+*80y-6_3pqfkmus9gk#klqrd5u+4vnu2&'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'channels',
    'daphne',
    'mysite',
    'blog',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ckeditor',
    'ckeditor_uploader',
    'baton',
    'django.contrib.admin',
    'baton.autodiscover',
    'allauth', # new
    'allauth.account', # new
    'allauth.socialaccount', # new
    'allauth.socialaccount.providers.microsoft',
]

ASGI_APPLICATION = 'mysite.asgi.application'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]


AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)


ROOT_URLCONF = 'mysite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [str(BASE_DIR) + '/templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                
            ],
        },
    },
]

WSGI_APPLICATION = 'mysite.wsgi.application'
ASGI_APPLICATION = 'mysite.asgi.application'

CSRF_TRUSTED_ORIGINS = ['https://promoblog.promoclick.digital', 'https://promoblog.promoclick.digital/']

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "art_blog",
        "USER": "claudioBezerra",
        "PASSWORD": "artBlog2023django",
        "HOST": "127.0.0.1",
        "PORT":"3306",
    
}
}

BATON = {
    'SITE_HEADER': 'PromoBlog Admin',
    'SITE_TITLE': 'PromoBlog',
    'INDEX_TITLE': 'Site administration',
    'SUPPORT_HREF': 'https://github.com/otto-torino/django-baton/issues',
    'COPYRIGHT': 'copyright © 2023 <a href="https://promoclick.digital/site/">PromoClick</a>', # noqa
    'POWERED_BY': '<a href="https://promoclick.digital/site/">PromoClick</a>',
    'CONFIRM_UNSAVED_CHANGES': True,
    'SHOW_MULTIPART_UPLOADING': True,
    'ENABLE_IMAGES_PREVIEW': True,
    'CHANGELIST_FILTERS_IN_MODAL': True,
    'CHANGELIST_FILTERS_ALWAYS_OPEN': False,
    'CHANGELIST_FILTERS_FORM': True,
    'COLLAPSABLE_USER_AREA': False,
    'MENU_ALWAYS_COLLAPSED': False,
    'MENU_TITLE': 'Menu',
    'MESSAGES_TOASTS': True,
    'GRAVATAR_DEFAULT_IMG': 'mp',
    'LOGIN_SPLASH': '/static/core/img/login-splash.png',
    'SEARCH_FIELD': {
        'label': 'Search contents...',
        'url': '/search/',
    },
    
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]



LANGUAGE_CODE = 'pt-BR'

TIME_ZONE = 'America/Sao_Paulo' 

USE_I18N = True

USE_L10N = True

USE_TZ = False

STATIC_URL = '/static/'
STATIC_ROOT = 'staticfiles'


MEDIA_URL = '/media/' 
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CKEDITOR_UPLOAD_PATH = "uploads/"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}

LOGIN_URL = '/acounts/login/'
# LOGIN_URL = '/accounts/microsoft/login/;'
LOGIN_REDIRECT_URL = 'post_list'

#EMAIL BACKEND OFFICE
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.office365.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'desenvolvimento@promovabr.com'
EMAIL_HOST_PASSWORD = 'fmjk*9813'
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'desenvolvimento@promovabr.com'


SOCIALACCOUNT_PROVIDERS = {
    'microsoft': {
        'TENANT': 'organizations',
        'REDIRECT_URI': 'https://promoblog.promoclick.digital/accounts/microsoft/login/callback/',
        'SCOPE': [
            'User.Read',
            'User.ReadBasic.All',
        ],
        
        'ACCOUNT_DEFAULT_HTTP_PROTOCOL': 'https',
        
    }
}

ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https'

