export class Utils {
  public static shortAddress(address: string, nbChars = 4) {
    let prefix = '';
    if (address.startsWith('0x')) {
      prefix = '0x';
      address = address.slice(2);
    }
    return `${prefix}${address
      .toLowerCase()
      .substring(0, nbChars)}-${address
      .toLowerCase()
      .substring(address.length - nbChars)}`;
  }
}
