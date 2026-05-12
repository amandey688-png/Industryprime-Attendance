from services.otp_service import _bcrypt_hash, _bcrypt_verify


def test_bcrypt_hash_verify():
    raw = "123456"
    hashed = _bcrypt_hash(raw)
    assert _bcrypt_verify(raw, hashed) is True
    assert _bcrypt_verify("999999", hashed) is False
