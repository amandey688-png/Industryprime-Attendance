from middleware.rate_limit import _bucket_key, _limits_for_path


def test_login_and_me_use_separate_buckets():
    assert _bucket_key("1.2.3.4", "/auth/login") != _bucket_key("1.2.3.4", "/auth/me")


def test_login_has_stricter_limit_than_default():
    login_limit, _ = _limits_for_path("/auth/login")
    default_limit, _ = _limits_for_path("/employees")
    assert login_limit < default_limit
