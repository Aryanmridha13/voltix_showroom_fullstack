from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.common'
    verbose_name = 'Common Utilities'

    def ready(self):
        """
        Apply compatibility patch for Python 3.14 context copy handling in Django.
        """
        try:
            from django.template.context import BaseContext

            def _safe_context_copy(self):
                obj = self.__class__.__new__(self.__class__)
                obj.__dict__.update(self.__dict__)
                obj.dicts = self.dicts[:]
                return obj

            BaseContext.__copy__ = _safe_context_copy
        except Exception:
            pass
