{pkgs}: {
  deps = [
    pkgs.emacsPackages.flycheck-clangcheck
    pkgs.miniball
    pkgs.rPackages.DIME
    pkgs.rPackages.AllPossibleSpellings
    pkgs.deepin.dwayland
    pkgs.ppsspp-qt
    pkgs.rubyPackages_3_2.forwardable-extended
    pkgs.python311Packages.pixel-ring
    pkgs.haskellPackages.dependent-map_0_2_4_0
  ];
}
